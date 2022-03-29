import * as d3 from 'd3';

import { Scales } from '../scales';

export const DataDots = {
    add: ({ map, payload }) => {
        const data = payload.locationData.features;
        const zoomExtent = [payload.data.minzoom, payload.data.minzoom];
        const metricExtent = d3.extent(data, (d) => Number(d.properties[payload.data.accessor.metric]));

        const layerProps = payload.data;
        const slices = Scales.quantileSlices({ data, layerProps });
        map.addLayer(
            {
                id: 'locations',
                type: 'circle',
                source: 'locations',
                minzoom: 4,
                paint: {
                    // 'fill-fill-sort-key': 10,
                    // increase the radius of the circle as the zoom level and dbh value increases
                    'circle-radius': {
                        property: payload.data.accessor.metric,
                        type: 'exponential',
                        stops: [
                            [{ zoom: 16, value: metricExtent[0] }, 6],
                            [{ zoom: 16, value: metricExtent[1] }, 6],
                            [{ zoom: 20, value: metricExtent[0] }, 30],
                            [{ zoom: 20, value: metricExtent[1] }, 30],
                        ],
                    },
                    'circle-color': [
                        'step',
                        ['get', layerProps.accessor.metric],
                        Scales.manualColors[0],
                        slices[1],
                        Scales.manualColors[1],
                        slices[2],
                        Scales.manualColors[2],
                        slices[3],
                        Scales.manualColors[3],
                        slices[4],
                        Scales.manualColors[4],
                    ],
                    // 'circle-stroke-color': 'white',
                    // 'circle-stroke-width': 1,
                    'circle-opacity': {
                        stops: [
                            [zoomExtent[0] - 2, 0],
                            [zoomExtent[0], 1],
                            [zoomExtent[1], 1],
                            [zoomExtent[1] + 2, 0],
                        ],
                    },
                },
            },
            // 'zipData',
        );
    },

};
