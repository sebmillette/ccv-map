export const Layers = {
    dots: ({ map, payload }) => {
        map.addLayer(
            {
                id: 'dots-locations',
                type: 'circle',
                source: 'locations',
                minzoom: 4,
                paint: {
                // increase the radius of the circle as the zoom level and dbh value increases
                    'circle-radius': {
                        property: 'metric',
                        type: 'exponential',
                        stops: [
                            [{ zoom: 16, value: payload.metricExtent[0] }, 8],
                            [{ zoom: 16, value: payload.metricExtent[1] }, 8],
                            [{ zoom: 20, value: payload.metricExtent[0] }, 30],
                            [{ zoom: 20, value: payload.metricExtent[1] }, 30],
                        ],
                    },
                    'circle-color': {
                        property: 'metric',
                        type: 'exponential',
                        stops: [
                            [payload.metricExtent[0], 'rgb(255,255,255)'],
                            [payload.metricExtent[1], 'rgb(184, 0, 92)'],
                        ],
                    },
                    'circle-stroke-color': 'white',
                    // 'circle-stroke-width': 1,
                    'circle-opacity': {
                        stops: [
                            [12, 0],
                            [15, 1],
                        ],
                    },
                },
            },
            'waterway-label',
        );
    },

    buildings: ({ map }) => {
        const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field'],
        ).id;
        map.addLayer(
            {
                id: 'add-3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 8,
                paint: {
                    'fill-extrusion-color': '#aaa',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height'],
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height'],
                    ],
                    'fill-extrusion-opacity': 0.6,
                },
            },
            labelLayerId,
        );
    },
    threeDigits: ({ map, payload }) => {
        /*
        ! TO DO : render colors of layers according to location data
        ! restrict layers to certain zoom
        ! repeat with other levels (city / municipality)
        */
        map.addLayer({
            id: 'threeDigits',
            type: 'line',
            source: 'threeDigits',
            layout: {},
            paint: {
                'line-width': 1,
                'line-color': '#FFF',
                'line-opacity': 0.6,
            },
        });

        map.addLayer({
            id: 'threeDigitsFill',
            type: 'fill',
            source: 'threeDigits',
            layout: {},
            paint: {
                'fill-color': '#FFF',
                'fill-opacity': 0.1,
            },
        });
    },
};
