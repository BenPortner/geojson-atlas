const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');
const PROJS = require('./projs.json');
const bboxClip = require('@turf/bbox-clip').default;
const bbox = require('@turf/bbox').default;
const { coordEach, coordAll, geomEach } = require('@turf/meta');
const clone = require('@turf/clone').default;
const { featureCollection, polygon } = require('@turf/helpers');
const { world_path, regions_path } = require('./paths');
const { isOnAntimeridian, joinMultiPolygonAlongAntimeridian } = require('./antimeridian');
const { feature } = require('@turf/helpers');


function getProj4(name) {
    const proj4Definition = PROJS.find((proj) => proj.name === name)?.proj4;
    if (!proj4Definition) {
        console.error('Unknown projection name: ' + name);
    }
    return proj4Definition;
}

function projectPoint(point, fromProj4, toProj4) {
    // fix projection wgs84 -> plate carree
    if (fromProj4.includes('proj=longlat') && point[1] <= -90) {
        point[1] = -89.99999999999999;
    }
    const res = proj4(fromProj4, toProj4, point);
    return res;
}

function projectFeatureCollection(fc, fromName, toName) {
    const fromProjection = getProj4(fromName);
    const toProjection = getProj4(toName);
    if (!fromProjection || !toProjection) {
        return;
    }

    const featureCollection = clone(fc);
    coordEach(featureCollection, (coord) => {
        const newCoord = projectPoint(coord, fromProjection, toProjection);
        coord[0] = newCoord[0];
        coord[1] = newCoord[1];
    });
    return featureCollection;
}

function getPolygons(feature) {
    if (feature.geometry.type === 'MultiPolygon') {
        return feature.geometry.coordinates.map(polygon);
    } else if (feature.geometry.type === 'Polygon') {
        return [feature];
    } else {
        console.error('Unknown geometry type: ' + feature.geometry.type);
        return [];
    }
}

function exportProjection(worldGeoJSON, projectionName, joinAntimeridian, projFeatureFilter, bbFeatureFilter, bboxMap, outFilePath) {
    // clone data before manipulating
    let world = clone(worldGeoJSON);

    // exclude countries to avoid projection issues
    world.features = world.features.filter(projFeatureFilter);

    // fix countries split along the antimeridian
    if (joinAntimeridian) {
        world.features
            .filter(isOnAntimeridian)
            .map(joinMultiPolygonAlongAntimeridian)

        if (joinAntimeridian === 'left') {
            world.features
                .flatMap(getPolygons)
                .filter((polygon) => coordAll(polygon).every((coord) => coord[0] > 0))
                .forEach((polygon) => coordEach(polygon, (coord) => (coord[0] -= 360)));
        } else if (joinAntimeridian === 'right') {
            world.features
                .flatMap(getPolygons)
                .filter((polygon) => coordAll(polygon).every((coord) => coord[0] < 0))
                .forEach((polygon) => coordEach(polygon, (coord) => (coord[0] += 360)));
        }
    }


    // apply projection if not wgs84
    if (projectionName !== 'wgs84') {
        world = projectFeatureCollection(world, 'wgs84', projectionName, 6);
        world = projectFeatureCollection(world, 'web_mercator', 'wgs84', 6);
    }

    // determine the bounding box and cut geometries outside of it
    const bbCountries = world.features.filter(bbFeatureFilter);
    bboxMap.set(projectionName, bboxMap.get(projectionName) ?? bbox(featureCollection(bbCountries)));
    world.features.forEach((feature) => {
        feature.geometry = bboxClip(feature.geometry, bboxMap.get(projectionName)).geometry;
    });

    // filter countries with empty geometries after cutting
    world.features = world.features.filter((feature) => feature.geometry.coordinates.length > 0);

    // export
    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, JSON.stringify(world, null, 0));
}

module.exports = {
    projectFeatureCollection,
    exportProjection,
};
