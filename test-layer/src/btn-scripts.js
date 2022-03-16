import * as d3 from 'd3';
import * as _ from 'lodash';

import { arrayToFeature } from '../../src/arrayToFeature';
import { Tools } from './Tools';

export const Buttons = {
    addListeners(map) {
        const buttons = document.querySelectorAll('.btn.active');
        buttons.forEach((element) => {
            const action = element.dataset.trigger;
            element.addEventListener('click', () => ButtonClick.trigger(map, action));
        });
    },
};

const ButtonClick = {
    trigger: async (map, action) => {
        const dataGeoJSON = async () => {
            const featureJSON = await ButtonClick.CSVToGeoJSON();
            Tools.saveAsJSON({ json: featureJSON, fileName: 'geoJSON.geojson' });
        };
        const choroplethGeoJSON = async () => {
            const groupDimension = 'Zip';
            const featureJSON = await ButtonClick.mergeGeoJSON({ groupDimension });
            Tools.saveAsJSON({ json: featureJSON, fileName: 'choroplethJSON.geojson' });
        };
        switch (action) {
        case 'data-geojson':
            dataGeoJSON();
            break;

        case 'data-choropleth':
            choroplethGeoJSON();
            break;

        default:
            break;
        }
    },

    CSVToGeoJSON: async () => {
        const createData = async () => {
            const response = await d3.csv('./data/raw-data.csv');
            // const properties = ['Latitude', 'Longitude',
            //     'Prix Ajusté', 'Superficie', 'Prix Vendu', 'id', 'Zip', 'City'];
            const properties = [
                { key: 'Latitude', type: 'integer' },
                { key: 'Longitude', type: 'integer' },
                { key: 'Prix Ajusté', type: 'integer' },
                { key: 'Superficie', type: 'integer' },
                { key: 'Prix Vendu', type: 'integer' },
                { key: 'id', type: 'integer' },
                { key: 'Zip', type: 'string' },
                { key: 'City', type: 'string' },
            ];
            const data = response.map((d) => _.pick(d, ...properties.map((p) => p.key)));

            return arrayToFeature.process({ data, properties });
        };

        return new Promise((resolve) => {
            resolve(createData());
        });
    },

    mergeGeoJSON: async ({ groupDimension }) => {
        const featureJSON = await ButtonClick.CSVToGeoJSON();
        const geoJSON = await d3.json('layer-data/3Digit_MTL.geojson');

        // group data by postal code
        const groupArray = featureJSON.features.map((d) => d.properties);
        const group = d3.group(groupArray, (d) => d[groupDimension]);

        // merge with featureJSON and sum or count or average the metric

        group.forEach((value, key) => {
            // console.log(d);
            const test = key;
            const zone = geoJSON.features.find((d) => d.properties.CFSAUID === key);
            zone.properties.metric = d3.mean(value, (v) => v.Superficie);
        });

        // add custom properties to geo JSON
        geoJSON.properties = {
            metric: 'Superficie',
            aggregation: 'AVG',
        };

        return geoJSON;
    },
};
