import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

export const Data = {
    load: ({ path }) => {
        const loadData = async () => {
            const response = await d3.json(path);
            return response;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    locationPropertyArray: (locationData) => locationData.features.map((d) => d.properties),

    loadGeo: ({ layerInfo, test }) => {
        const geo = {};

        const loadData = async () => {
            test.appState = {
                type: 'test',
                value: '-',
                message: 'data check',
                data: layerInfo.data[0],
            };

            const geoJSON = typeof layerInfo.geoJSON === 'string'
                ? await d3.json(layerInfo.geoJSON)
                : layerInfo.geoJSON;
            const geoData = typeof layerInfo.data === 'string'
                ? await d3.json(layerInfo.data)
                : layerInfo.data;

            test.appState = {
                type: 'test 2',
                value: '-',
                message: 'data check 2',
                data: geoData[0],
            };
            Data.mergeLocationWithGeo({
                layerInfo,
                geoJSON,
                geoData,
            });
            geo[layerInfo.name] = geoJSON;
            return geo;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    mergeLocationWithGeo: async ({ layerInfo, geoJSON, geoData }) => {
        const metricAccessor = layerInfo.metricAccessor;
        const geoKey = layerInfo.geoKey;

        geoJSON.features.forEach((d, i) => {
            const keyValue = d.properties[geoKey];
            const dataBlock = geoData.find((entry) => keyValue.toString() === entry[geoKey].toString());
            d.id = i;
            if (dataBlock) {
                Object.keys(dataBlock).forEach((blockKey) => {
                    d.properties[blockKey] = !dataBlock || dataBlock[blockKey] === null ? 0 : dataBlock[blockKey];
                });
            }
        });

        // add custom properties to geo JSON
        geoJSON.properties = {
            metric: metricAccessor,
        };

        return geoJSON;
    },

    calculateGeoCenter: ({ payload }) => {
        const geoType = payload.map.geoCenterType;

        const calculateGeoLatExtent = () => {
            const geoArray = payload.locationData.features.map((d) => d.geometry.coordinates);
            const geoLongExtent = d3.extent(geoArray, (d) => d[1]);
            const geoLatExtent = d3.extent(geoArray.map((d) => d[0]));
            return { geoLatExtent, geoLongExtent };
        };

        const dataGeoCenter = () => {
            const { geoLatExtent, geoLongExtent } = calculateGeoLatExtent();
            const middle = (extent) => (extent[1] - extent[0]) / 2 + extent[0];
            return [middle(geoLatExtent), middle(geoLongExtent)];
        };

        const dataGeoBounds = () => {
            const { geoLatExtent, geoLongExtent } = calculateGeoLatExtent();
            return new mapboxgl.LngLatBounds(
                new mapboxgl.LngLat(geoLatExtent[0], geoLongExtent[0]),
                new mapboxgl.LngLat(geoLatExtent[1], geoLongExtent[1]),
            );
        };

        switch (geoType) {
        case 'manual':
            return payload.map.geoCenterString.split(',').map((d) => Number(d));

        case 'dataCenter':
            return dataGeoCenter();

        case 'dataBound':
            return dataGeoBounds();

        default:
            return [-73.595717, 45.488102];
        }
    },

    // calculateMetricExtent({ data, accessor }) {
    //     return d3.extent(data, (d) => Number(d.properties[accessor]));
    // },

};
