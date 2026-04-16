const fs = require('fs');
const path = require('path');
const { projectFeatureCollection } = require('./helpers/projection');
const { world_path } = require('./helpers/paths');

const inputMaps = [
    '10m/ne_10m_admin_0_countries.geojson',
    '50m/ne_50m_admin_0_countries.geojson',
    '110m/ne_110m_admin_0_countries.geojson',
];
const projections = ['plate_carree', 'mollweide', 'miller', 'behrmann'];

for (const filename of inputMaps) {
    const inputFile = path.join(world_path, filename);
    for (const projection of projections) {
        const data = fs.readFileSync(inputFile, 'utf8');
        const obj = JSON.parse(data);

        // project from wgs84 (geojson standard) to the desired system
        let projected = projectFeatureCollection(obj, 'wgs84', projection, 6);

        // project to pseudo-wgs84 for proper display with web mercator renderer
        projected = projectFeatureCollection(projected, 'web_mercator', 'wgs84', 6);

        // export
        const outputFile = path.join(
            world_path,
            filename.replace('.geojson', `-${projection}.geojson`)
        );
        fs.writeFileSync(outputFile, JSON.stringify(projected, null, 0));
    }
}
