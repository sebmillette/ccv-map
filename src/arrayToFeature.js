export const arrayToFeature = {
    process: ({ data, properties }) => {
        const featureJSON = arrayToFeature.obj;
        featureJSON.features = data.map((d) => {
            // if (typeof d.Lat === 'string') return arrayToFeature.empty;
            const obj = {};
            obj.type = 'Feature';

            // collect properties
            obj.properties = {};
            properties.forEach((p) => {
                obj.properties[p.key] = p.type === 'integer'
                    ? Number(d[p.key]) : d[p.key];
            });

            // set geometry
            const geometry = {};
            geometry.type = 'Point';
            geometry.coordinates = [Number(d.Longitude), Number(d.Latitude)];
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
