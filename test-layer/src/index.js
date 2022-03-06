import * as _ from 'lodash';
import config from '../config.json';
import { MapCCV } from '../../src/CCV';

import './css/base.scss';

const containerId = 'dev-map';
const container = document.getElementById(containerId);

const payload = {
    MAPBOX_API: config.MAPBOX_API,
    id: containerId,
};
const map = new MapCCV(payload);
map.create();

/**
 * Resize Map when container resizes
 */
const debounce = _.debounce(() => {
    map.payload.width = container.offsetWidth;
    map.payload.height = container.offsetHeight;
    map.update();
}, 100);

const resizeObserver = new ResizeObserver((entries) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of entries) {
        if (entry.target.id === containerId) {
            debounce();
        }
    }
});

resizeObserver.observe(container);
