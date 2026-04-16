const https = require('https');
const fs = require('fs');
const path = require('path');
const { coordAll, coordEach } = require('@turf/meta');
const { isOnAntimeridian, joinMultiPolygonAlongAntimeridian } = require('./helpers/antimeridian');
const { countries_path } = require('./helpers/paths');

function process_france() {
    // remove overseas departments
    const files = fs.globSync(path.join(countries_path, '**/FR.geojson'));
    for (const file of files) {
        const outfile = file.replace('FR.geojson', 'FR-main.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        obj.features = obj.features.filter(
            (feature) => feature.properties.type_en !== 'Overseas department'
        );
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_spain() {
    // remove "region": "Canary Is."
    const files = fs.globSync(path.join(countries_path, '**/ES.geojson'));
    for (const file of files) {
        const outfile = file.replace('ES.geojson', 'ES-main.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        obj.features = obj.features.filter((feature) => feature.properties.region !== 'Canary Is.');
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_portugal() {
    // remove "name": "Azores" and "name": "Madeira"
    const files = fs.globSync(path.join(countries_path, '**/PT.geojson'));
    for (const file of files) {
        const outfile = file.replace('PT.geojson', 'PT-main.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        obj.features = obj.features.filter(
            (feature) =>
                feature.properties.name !== 'Azores' && feature.properties.name !== 'Madeira'
        );
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_netherlands() {
    // remove special municipalities (e.g. Caribbean Netherlands)
    const files = fs.globSync(path.join(countries_path, '**/NL.geojson'));
    for (const file of files) {
        const outfile = file.replace('NL.geojson', 'NL-main.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        obj.features = obj.features.filter(
            (feature) => feature.properties.type_en !== 'Special Municipality'
        );
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_norway() {
    // remove Bouvet Island
    const files = fs.globSync(path.join(countries_path, '**/NO.geojson'));
    for (const file of files) {
        const outfile = file.replace('NO.geojson', 'NO-main.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        obj.features = obj.features.filter(
            (feature) => feature.properties.name !== 'Bouvet Island'
        );
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_usa() {
    // join polygons, which are split by the antimeridian
    const files = fs.globSync(path.join(countries_path, '**/US.geojson'));
    for (const file of files) {
        const outfile = file.replace('US.geojson', 'US-joined.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        // join polygons
        obj.features.filter(isOnAntimeridian).forEach(joinMultiPolygonAlongAntimeridian);
        // subtract 360 longitude from coordinates that are east of the 0-meridian
        obj.features
            .filter((feature) => coordAll(feature).every((coord) => coord[0] > 0))
            .map((feature) => coordEach(feature, (coord) => (coord[0] -= 360)));
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_russia() {
    // join polygons, which are split by the antimeridian
    const files = fs.globSync(path.join(countries_path, '**/RU.geojson'));
    for (const file of files) {
        const outfile = file.replace('RU.geojson', 'RU-joined.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        // join polygons
        obj.features.filter(isOnAntimeridian).forEach(joinMultiPolygonAlongAntimeridian);
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function process_fiji() {
    // join polygons, which are split by the antimeridian
    const files = fs.globSync(path.join(countries_path, '**/FJ.geojson'));
    for (const file of files) {
        const outfile = file.replace('FJ.geojson', 'FJ-joined.geojson');
        const data = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(data);
        // join polygons
        obj.features.filter(isOnAntimeridian).forEach(joinMultiPolygonAlongAntimeridian);
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 0));
    }
}

function main() {
    process_france();
    process_spain();
    process_portugal();
    process_netherlands();
    process_usa();
    process_norway();
    process_russia();
    process_fiji();
}

main();
