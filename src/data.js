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

    loadGeo({ payload }) {
        const geo = {};
        const groupDimension = 'Zip';
        const locationData = payload.locationData;
        const metricAccessor = payload.data.accessors.metric;

        const loadData = async () => {
            const geoData = await d3.json(payload.data.zipData);

            Data.mergeLocationWithGeo({
                groupDimension,
                geoData,
                locationData,
                metricAccessor,
            });
            geo.zipData = geoData;
            return geo;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

    mergeLocationWithGeo: async ({ groupDimension, geoData, locationData, metricAccessor }) => {
        // group data by postal code
        const groupArray = locationData.features.map((d) => d.properties);
        const group = d3.group(groupArray, (d) => d[groupDimension]);

        // Each zip code is expected to get a metric

        geoData.features.forEach((d, i) => {
            const zipCode = d.properties.CFSAUID;
            d.id = i;
            d.zip = zipCode;
            const zone = group.get(zipCode);
            d.properties[metricAccessor] = zone ? d3.mean(zone, (v) => v[metricAccessor]) : 0;
        });

        // add custom properties to geo JSON
        geoData.properties = {
            metric: metricAccessor,
            aggregation: 'AVG',
        };

        return geoData;
    },

    calculateGeoCenter({ payload }) {
        const geoType = payload.map.geoCenterType;

        const dataGeoCenter = () => {
            const geoArray = payload.locationData.features.map((d) => d.geometry.coordinates);
            const geoLongExtent = d3.extent(geoArray, (d) => d[1]);
            const geoLatExtent = d3.extent(geoArray.map((d) => d[0]));
            const middle = (extent) => (extent[1] - extent[0]) / 2 + extent[0];
            return [middle(geoLatExtent), middle(geoLongExtent)];
        };

        switch (geoType) {
        case 'data':
            return dataGeoCenter();
            // return [-73.615967, 45.4637115];

        case 'manual':
            return payload.map.geoCenterValue.split(',').map((d) => Number(d));

        case 'postalCode':
            /*
            ! calculate extent of postal code shape >> See bound example on zip layer
             */
            return [-73.595717, 45.488102];

        default:
            return [-73.595717, 45.488102];
        }
    },

    calculateMetricExtent({ payload }) {
        const accessor = payload.data.accessors.metric;
        return d3.extent(payload.locationData.features, (d) => Number(d.properties[accessor]));
    },

};
