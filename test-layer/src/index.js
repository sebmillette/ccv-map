import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as _ from 'lodash';
import config from '../config.json';
import { MapCCV } from '../../src/CCV';
import { GUI } from './gui';

import './css/base.scss';

const loadMap = () => {
    const containerId = 'dev-map';
    const container = document.getElementById(containerId);

    const payload = {
        MAPBOX_API: config.MAPBOX_API,
        id: containerId,
        map: {
            style: 'dark-v10',
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

/**
 * Resize Map when container resizes
 */
// const debounce = _.debounce(() => {
//     map.payload.width = container.offsetWidth;
//     map.payload.height = container.offsetHeight;
//     map.update();
// }, 100);

// const resizeObserver = new ResizeObserver((entries) => {
//     // eslint-disable-next-line no-restricted-syntax
//     for (const entry of entries) {
//         if (entry.target.id === containerId) {
//             debounce();
//         }
//     }
// });

// resizeObserver.observe(container);
