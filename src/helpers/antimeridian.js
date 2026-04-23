const { default: union } = require('@turf/union');
const { coordAll, coordEach } = require('@turf/meta');
const { polygon, featureCollection } = require('@turf/helpers');
const { combine } = require('@turf/combine');

function isOnAntimeridian(x) {
    return coordAll(x).some((coord) => Math.abs(coord[0]) >= 179);
}

function joinMultiPolygonAlongAntimeridian(feature) {
    if (feature.geometry.type == 'Polygon') {
        return feature; // nothing to do
    } else if (feature.geometry.type !== 'MultiPolygon') {
        console.error(
            'Antimeridian union not implemented for feature type ' + feature.geometry.type
        );
        return feature;
    }
    const polygons = feature.geometry.coordinates.map(polygon);
    // add 360 longitude to all coordinates that are on the "left" side of the meridian
    polygons
        .filter((poly) => coordAll(poly).every((coord) => coord[0] < 0))
        .forEach((poly) => coordEach(poly, (coord) => (coord[0] += 360)));
    const antiMeridianPolygons = polygons.filter(isOnAntimeridian);
    const otherPolygons = polygons.filter((poly) => !isOnAntimeridian(poly));
    // join all antimeridian polygons into a single polygon
    const joined = union(featureCollection(antiMeridianPolygons));
    // put the new polygon together with the other polygons that don't touch the antimeridian
    const combined = combine(featureCollection([...otherPolygons, joined]));
    feature.geometry.coordinates = combined.features[0].geometry.coordinates;
    return feature;
}

module.exports = {
    isOnAntimeridian,
    joinMultiPolygonAlongAntimeridian,
};
