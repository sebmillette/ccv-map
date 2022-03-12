export const arrayToFeature = {
    process: ({ data }) => {
        const featureJSON = arrayToFeature.obj;
        featureJSON.features = data.map((d) => {
            if (typeof d.Lat === 'string') return arrayToFeature.empty;
            const obj = {};
            obj.type = 'Feature';
            const metric = d.metric;
            obj.properties = { metric };
            obj.properties.id = d['Numero Centris'];

            const geometry = {};
            geometry.type = 'Point';
            geometry.coordinates = [d.Lat, d.Long];
            obj.geometry = geometry;
            return obj;
        });
        return featureJSON;
    },

    obj: {
        type: 'FeatureCollection',
    },
    empty: {
        type: 'Feature',
        properties: {
            metric: '100',
        },
        geometry: {
            type: 'Point',
            coordinates: [
                -73.573704,
                45.506989,
            ],
        },

    },
};
