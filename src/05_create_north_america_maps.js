const fs = require('fs');
const path = require('path');
const bboxClip = require('@turf/bbox-clip').default;
const clone = require('@turf/clone').default;
const bbox = require('@turf/bbox').default;
const featureCollection = require('@turf/helpers').featureCollection;
const { coordAll, coordEach } = require('@turf/meta');
const { world_path, regions_path } = require('./helpers/paths');
const { projectFeatureCollection } = require('./helpers/projection');
const { isOnAntimeridian, joinMultiPolygonAlongAntimeridian } = require('./helpers/antimeridian');


const worldFiles = [
    '110m/ne_110m_admin_0_countries.geojson',
    '50m/ne_50m_admin_0_countries.geojson',
    '10m/ne_10m_admin_0_countries.geojson',
];

for (const filename of worldFiles) {
    // load world map
    const data = fs.readFileSync(path.join(world_path, filename), 'utf8');
    const obj = JSON.parse(data);

    // exclude antarctica to avoid projection issues
    const countries = obj.features.filter((feature) => feature.properties.NAME !== 'Antarctica');

    // fix Russia and USA split along the antimeridian
    countries
        .filter(isOnAntimeridian)
        .map(joinMultiPolygonAlongAntimeridian)
        .filter((feature) => coordAll(feature).every((coord) => coord[0] > 0))
        .forEach((feature) => coordEach(feature, (coord) => (coord[0] -= 360)));

    // save copy before cutting
    const worldCopy = clone(featureCollection(countries));

    // determine the bounding box and cut geometries outside of it
    const bbCountries = countries.filter((feature) => {
        const subregions = ['Northern America', 'Central America', 'Caribbean'];
        return subregions.includes(feature.properties.SUBREGION);
    });
    const bboxCoords = bbox(featureCollection(bbCountries));
    countries.forEach((feature) => {
        feature.geometry = bboxClip(feature.geometry, bboxCoords).geometry;
    });

    // filter countries with empty geometries after cutting and store in new feature collection
    const region = featureCollection(countries.filter((feature) => feature.geometry.coordinates.length > 0));

    // export WGS84
    const outputFilename = filename.replace('admin_0_countries', 'north_america');
    const outFilePath = path.join(regions_path, outputFilename);
    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, JSON.stringify(region, null, 0));

    // project North America Equidistant Conic projection
    let projectedGeojson = projectFeatureCollection(worldCopy, 'wgs84', 'north_america_eqdc', 6);
    projectedGeojson = projectFeatureCollection(projectedGeojson, 'web_mercator', 'wgs84', 6);

    // determine bounding box
    const projectedBbCountries = projectedGeojson.features.filter((feature) => {
        const subregions = ['Northern America', 'Central America', 'Caribbean'];
        return subregions.includes(feature.properties.SUBREGION);
    });
    const projectedBbox = bbox(featureCollection(projectedBbCountries));
    countries.forEach((feature) => {
        feature.geometry = bboxClip(feature.geometry, bboxCoords).geometry;
    });
    projectedGeojson.features.forEach((feature) => {
        feature.geometry = bboxClip(feature.geometry, projectedBbox).geometry;
    });

    // export projected version
    const projectedOutputFilename = filename.replace('admin_0_countries', 'north_america_eqdc');
    const projectedOutFilePath = path.join(regions_path, projectedOutputFilename);
    fs.mkdirSync(path.dirname(projectedOutFilePath), { recursive: true });
    fs.writeFileSync(projectedOutFilePath, JSON.stringify(projectedGeojson, null, 0));
}
