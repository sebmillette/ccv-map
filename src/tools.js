import * as _ from 'lodash';
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
};
