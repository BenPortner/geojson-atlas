const proj4 = require('proj4');
const PROJS = require('./projs.json');
const coordEach = require('@turf/meta').coordEach;
const clone = require('@turf/clone').default;

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

module.exports = {
    projectFeatureCollection,
};
