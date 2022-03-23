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

    loadGeo: ({ layerInfo, locationData }) => {
        const geo = {};

        const loadData = async () => {
            const geoData = await d3.json(layerInfo.path);

            Data.mergeLocationWithGeo({
                layerInfo,
                geoData,
                locationData,
            });
            geo[layerInfo.name] = geoData;
            return geo;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    mergeLocationWithGeo: async ({ layerInfo, geoData, locationData }) => {
        const dataKey = layerInfo.dataKey;
        const metricAccessor = layerInfo.accessor.metric;
        const geoKey = layerInfo.geoKey;

        // group data by postal code
        const dataArray = locationData.features.map((d) => d.properties);
        const group = d3.group(dataArray, (d) => d[dataKey]);

        geoData.features.forEach((d, i) => {
            const key = d.properties[geoKey];
            d.id = i;
            const zone = Number.isNaN(Number(key)) ? group.get(key) : group.get(Number(key));
            d.properties[metricAccessor] = zone ? d3.mean(zone, (v) => v[metricAccessor]) : 0;
        });

        // add custom properties to geo JSON
        geoData.properties = {
            metric: metricAccessor,
            aggregation: 'AVG',
        };

        return geoData;
    },

    calculateGeoCenter: ({ payload }) => {
        const geoType = payload.map.geoCenterType;
        const geoArray = payload.locationData.features.map((d) => d.geometry.coordinates);
        const geoLongExtent = d3.extent(geoArray, (d) => d[1]);
        const geoLatExtent = d3.extent(geoArray.map((d) => d[0]));

        const dataGeoCenter = () => {
            const middle = (extent) => (extent[1] - extent[0]) / 2 + extent[0];
            return [middle(geoLatExtent), middle(geoLongExtent)];
        };

        const dataGeoBounds = () => new mapboxgl.LngLatBounds(
            new mapboxgl.LngLat(geoLatExtent[0], geoLongExtent[0]),
            new mapboxgl.LngLat(geoLatExtent[1], geoLongExtent[1]),
        );

        switch (geoType) {
        case 'manual':
            return payload.map.geoCenterValue.split(',').map((d) => Number(d));

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
