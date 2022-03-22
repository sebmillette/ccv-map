import * as d3 from 'd3';

export const DataDots = {
    add: ({ map, payload }) => {
        const data = payload.locationData.features;
        const zoomExtent = payload.data.zoomVisibility;
        const metricExtent = d3.extent(data, (d) => Number(d.properties[payload.data.accessor.metric]));
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
                            [{ zoom: 16, value: metricExtent[0] }, 5],
                            [{ zoom: 16, value: metricExtent[1] }, 5],
                            [{ zoom: 20, value: metricExtent[0] }, 30],
                            [{ zoom: 20, value: metricExtent[1] }, 30],
                        ],
                    },
                    'circle-color': {
                        property: payload.data.accessor.metric,
                        type: 'exponential',
                        stops: [
                            [metricExtent[0], 'rgb(255,255,255)'],
                            [metricExtent[1], 'rgb(120, 50, 22)'],
                        ],
                    },
                    'circle-stroke-color': 'white',
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
