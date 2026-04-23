const fs = require('fs');
const path = require('path');
const bboxClip = require('@turf/bbox-clip').default;
const clone = require('@turf/clone').default;
const bbox = require('@turf/bbox').default;
const featureCollection = require('@turf/helpers').featureCollection;
const { coordAll, coordEach } = require('@turf/meta');
const { world_path, regions_path } = require('./helpers/paths');
const { exportProjection } = require('./helpers/projection');
const { isOnAntimeridian, joinMultiPolygonAlongAntimeridian } = require('./helpers/antimeridian');


const worldFiles = [
    '110m/ne_110m_admin_0_countries.geojson',
    '50m/ne_50m_admin_0_countries.geojson',
    '10m/ne_10m_admin_0_countries.geojson',
];
const projections = ['wgs84', 'north_america_eqdc'];
const bboxMap = new Map();  // use the same bounding box for all resolutions

for (const filename of worldFiles) {
    // load world map
    const data = fs.readFileSync(path.join(world_path, filename), 'utf8');
    const worldGeoJSON = JSON.parse(data);
    // calculate and export projections
    for (const projection of projections) {
        const outFileName = filename.replace('admin_0_countries', projection === 'wgs84' ? 'north_america' : projection);
        const outFilePath = path.join(regions_path, outFileName);
        exportProjection(
            worldGeoJSON,
            projection,
            'left',
            (feature) => feature.properties.NAME !== 'Antarctica',
            (feature) => ['Northern America', 'Central America', 'Caribbean'].includes(feature.properties.SUBREGION),
            bboxMap,
            outFilePath
        );
    }
}
