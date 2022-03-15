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
            console.log(element);
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
            const featureJSON = await ButtonClick.mergeGeoJSON();
            const choroplethJSON = {};
            // Tools.saveAsJSON({ json: featureJSON, fileName: 'choroplethJSON.geojson' });
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
            const properties = ['Latitude', 'Longitude',
                'Prix Ajusté', 'Superficie', 'Prix Vendu', 'id', 'Zip', 'City'];
            const data = response.map((d) => _.pick(d, ...properties));

            return arrayToFeature.process({ data, properties });
        };

        return new Promise((resolve) => {
            resolve(createData());
        });
    },

    mergeGeoJSON: async () => {
        const featureJSON = await ButtonClick.CSVToGeoJSON();

        // group data by postal code

        // sum or count or average the metric

        // merge with featureJSON

        // save or use on the fly

        console.log(featureJSON);
    },
};
