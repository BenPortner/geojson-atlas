const https = require('https');
const fs = require('fs');
const path = require('path');
const { default: union } = require('@turf/union');
const { coordAll, coordEach } = require('@turf/meta');
const { polygon, featureCollection } = require('@turf/helpers');
const { combine } = require('@turf/combine');
const { ne_path, world_path, countries_path } = require('./helpers/paths');

// download natural earth data
const url =
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
const world_files = [path.join(world_path, '10m', 'ne_10m_admin_1_states_provinces.geojson')];

function extract_countries(file) {
    const data = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(data);
    // group features by iso_a3 keys
    const grouped = obj.features.reduce((acc, obj) => {
        const key = obj.properties.iso_a2;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
    // write to file
    const resolution = file.split(path.sep).slice(-2)[0];
    const target = path.join(countries_path, resolution);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    for (const [key, value] of Object.entries(grouped)) {
        const outpath = path.join(target, `${key}.geojson`);
        fs.writeFileSync(
            outpath,
            JSON.stringify(
                {
                    type: 'FeatureCollection',
                    features: value,
                },
                null,
                0
            )
        );
    }
}

function main() {
    world_files.forEach(extract_countries);
}

main();
