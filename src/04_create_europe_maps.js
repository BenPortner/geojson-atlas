const fs = require('fs');
const path = require('path');
const bboxClip = require('@turf/bbox-clip').default;
const clone = require('@turf/clone').default;
const { world_path, regions_path } = require('./helpers/paths');
const { projectFeatureCollection } = require('./helpers/projection');

const worldFiles = [
    '110m/ne_110m_admin_0_countries.geojson',
    '50m/ne_50m_admin_0_countries.geojson',
    '10m/ne_10m_admin_0_countries.geojson',
];

for (const filename of worldFiles) {
    // load world map
    const data = fs.readFileSync(path.join(world_path, filename), 'utf8');
    const obj = JSON.parse(data);

    // filter European countries.
    const europeCountries = obj.features.filter((feature) => {
        // exclude Greenland
        if (feature.properties.NAME === 'Greenland') {
            return false;
        }
        // ensure that Turkey and Cyprus are included
        const isRegion = feature.properties.REGION_WB === 'Europe & Central Asia';
        // ensure that Malta is included
        const isContinent = feature.properties.CONTINENT === 'Europe';
        if (isRegion || isContinent) {
            return true;
        }
        return false;
    });

    // create feature collection
    const europe = {
        type: 'FeatureCollection',
        features: europeCountries,
    };

    // save copy before cutting
    const europeCopy = clone(europe);

    // cut out Azores, French Guiana, the Asian part of Russia and Turkey
    const bbox = [-25, 34, 43, 72];
    europe.features.map((feature) => {
        feature.geometry = bboxClip(feature.geometry, bbox).geometry;
    });

    // export WGS84
    const outputFilename = filename.replace('admin_0_countries', 'europe');
    const outFilePath = path.join(regions_path, outputFilename);
    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, JSON.stringify(europe, null, 0));

    // export Lambert Conformal Conical (LCC) projection
    let projectedGeojson = projectFeatureCollection(europeCopy, 'wgs84', 'lambert_europe', 6);
    projectedGeojson = projectFeatureCollection(projectedGeojson, 'web_mercator', 'wgs84', 6);
    const projectedBbox = [-15, -16, 20.9, 19.5]; // bbox in pseudo-wgs84 coordinates
    projectedGeojson.features.map((feature) => {
        feature.geometry = bboxClip(feature.geometry, projectedBbox).geometry;
    });
    const projectedOutputFilename = filename.replace('admin_0_countries', 'europe-lcc');
    const projectedOutFilePath = path.join(regions_path, projectedOutputFilename);
    fs.mkdirSync(path.dirname(projectedOutFilePath), { recursive: true });
    fs.writeFileSync(projectedOutFilePath, JSON.stringify(projectedGeojson, null, 0));
}
