import * as _ from 'lodash';
import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

export const Tools = {
    calculateBounds: ({ feature }) => {
        const coordinates = feature.geometry.coordinates;
        const type = feature.geometry.type;

        const coordinateArray = type === 'Polygon'
            ? _.flatten(coordinates)
            : _.flatten(_.flatten(coordinates));

        // Create a 'LngLatBounds' with both corners at the first coordinate.
        const bounds = new mapboxgl.LngLatBounds(
            coordinateArray[0],
            coordinateArray[0],
        );

        coordinateArray.forEach((d) => bounds.extend(d));

        return bounds;
    },

    centerOfBounds: ({ bounds }) => {
        const latDiff = Math.abs(bounds._sw.lat - bounds._ne.lat);
        const lngDiff = Math.abs(bounds._ne.lng - bounds._sw.lng);
        const latMin = d3.min([bounds._sw.lat, bounds._ne.lat]);
        const lngMin = d3.min([bounds._ne.lng, bounds._sw.lng]);

        const lat = latMin + latDiff / 2;
        const lng = lngMin + lngDiff / 2;
        // move map to the center of this bound

        const center = [lng, lat];

        return center;
    },
};
