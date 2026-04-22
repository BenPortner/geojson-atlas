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
    '10m/ne_10m_admin_0_countries.geojson',
    '50m/ne_50m_admin_0_countries.geojson',
    '110m/ne_110m_admin_0_countries.geojson',
];
const projections = ['wgs84', 'south_america_eqdc'];

const bboxCoords = new Map();  // use the same bounding box for all resolutions
for (const filename of worldFiles) {
    // load world map
    const data = fs.readFileSync(path.join(world_path, filename), 'utf8');
    const obj = JSON.parse(data);

    for (const projection of projections) {

        // clone data before manipulating
        let world = clone(obj);

        // exclude russia to avoid projection issues
        world.features = world.features.filter((feature) => feature.properties.NAME !== 'Russia');

        // apply projection if not wgs84
        if (projection !== 'wgs84') {
            world = projectFeatureCollection(world, 'wgs84', projection, 6);
            world = projectFeatureCollection(world, 'web_mercator', 'wgs84', 6);
        }

        // determine the bounding box and cut geometries outside of it
        const bbCountries = world.features.filter((feature) => {
            return feature.properties.SUBREGION === 'South America';
        });
        bboxCoords.set(projection, bboxCoords.get(projection) ?? bbox(featureCollection(bbCountries)));
        world.features.forEach((feature) => {
            feature.geometry = bboxClip(feature.geometry, bboxCoords.get(projection)).geometry;
        });

        // filter countries with empty geometries after cutting and store in new feature collection
        world.features = world.features.filter((feature) => feature.geometry.coordinates.length > 0);

        // export
        const suffix = projection === 'wgs84' ? 'south_america' : `${projection}`;
        const outputFilename = filename.replace('admin_0_countries', suffix);
        const outFilePath = path.join(regions_path, outputFilename);
        fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
        fs.writeFileSync(outFilePath, JSON.stringify(world, null, 0));
    }
}
