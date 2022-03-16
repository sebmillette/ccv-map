import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as _ from 'lodash';
import config from '../config.json';
import { MapCCV } from '../../src/CCV';
import { GUI } from './gui';
import { Buttons } from './btn-scripts';

import './css/base.scss';

const loadMap = () => {
    const containerId = 'dev-map';

    const payload = {
        MAPBOX_API: config.MAPBOX_API,
        id: containerId,
        map: {
            style: 'dark-v10',
            zoom: 12,
            geoCenterType: 'data', // [manual, postalCode]
            geoCenterValue: '-73.595, 45.488',
        },
        data: {
            locationPath: 'data/locations.geojson', // GeoJSON with properties
            zipData: 'data/3Digit_MTL.geojson', // GeoJSON without metrics
            accessors: {
                metric: 'Superficie',
            },
        },
    };
    const map = new MapCCV(payload);
    map.create();

    GUI.create({ payload, map });

    Buttons.addListeners(map);
};

document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});
