const fs = require('fs');
const path = require('path');
const { coordAll } = require('@turf/meta');
const { isOnAntimeridian } = require('./antimeridian');
const { geojson_path } = require('./paths');

const files = fs.globSync(path.join(geojson_path, '**/*.geojson'));
for (const file of files) {
    const data = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(data);
    const antimeridianFeatures = obj.features.filter(isOnAntimeridian);
    if (antimeridianFeatures.length > 0) {
        console.log(`File ${file} has features on the antimeridian`);
    }
}
