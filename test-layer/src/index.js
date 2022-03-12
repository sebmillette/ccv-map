import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as _ from 'lodash';
import config from '../config.json';
import { MapCCV } from '../../src/CCV';
import { GUI } from './gui';

import './css/base.scss';

const loadMap = () => {
    const containerId = 'dev-map';

    const payload = {
        MAPBOX_API: config.MAPBOX_API,
        id: containerId,
        map: {
            style: 'dark-v10',
            zoom: 13,
            geoCenterType: 'data', // [manual, postalCode]
            geoCenterValue: '[-73.595717, 45.488102]',
        },
        data: {
            path: 'data/locations.json',
        },
    };
    const map = new MapCCV(payload);
    map.create();

    GUI.create({ payload, map });
};

document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});
