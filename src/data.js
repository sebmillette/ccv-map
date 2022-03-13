import * as d3 from 'd3';

export const Data = {
    load({ path }) {
        const loadData = async () => {
            const response = await d3.json(path);
            return response;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    loadGeo() {
        const geo = {};
        const loadData = async () => {
            const response = await d3.json('./layer-data/3Digit_MTL.geojson');
            geo.threeDigits = response;
            return geo;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    calculateGeoCenter({ payload }) {
        const geoType = payload.map.geoCenterType;

        const dataGeoCenter = () => {
            const geoArray = payload.data.features.map((d) => d.geometry.coordinates);
            const geoLatExtent = d3.extent(geoArray.map((d) => d[0]));
            const geoLongExtent = d3.extent(geoArray, (d) => d[1]);
            const middle = (extent) => (extent[1] - extent[0]) / 2 + extent[0];
            return [middle(geoLatExtent), middle(geoLongExtent)];
        };

        switch (geoType) {
        case 'data':
            return dataGeoCenter();

        case 'manual':
            return payload.map.geoCenterValue.split(',').map((d) => Number(d));

        case 'postalCode':
            /*
            ! calculate extent of postal code shape
             */
            return [-73.595717, 45.488102];

        default:
            return [-73.595717, 45.488102];
        }
    },

    calculateMetricExtent({ payload }) {
        return d3.extent(payload.data.features, (d) => d.properties.metric);
    },

};
