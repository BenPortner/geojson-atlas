const path = require('path');

const geojson_path = path.resolve(__dirname, '../../geojson');
const ne_path = path.resolve(geojson_path, 'natural_earth');
const world_path = path.join(ne_path, 'world');
const countries_path = path.join(ne_path, 'countries');
const regions_path = path.join(ne_path, 'regions');

module.exports = {
    geojson_path,
    ne_path,
    world_path,
    countries_path,
    regions_path,
};
