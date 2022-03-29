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
            style: 'light-v10',
            zoom: 5,
            currentZoom: 5,
            geoCenterType: 'dataBound', // [manual, dataBound, dataCenter]
            geoCenterString: '-73.595, 45.488',
            showBuildings: true,
        },
        data: {
            locationPath: 'data/QC_CONDO_SOLD_METRIC.geojson', // GeoJSON with properties
            showAsLayer: true,
            // zoomVisibility: [15, 20],
            minzoom: 15,
            maxzoom: 20,
            accessor: {
                metric: 'PRICE_BY_SQMETER',
                type: 'NUMBER', // [NUMBER, CURRENCY]
                aggregation: 'median', // [mean, median, sum, count]
                unit: '$/m2',
            },
        },
        layers: [
            {
                name: 'cityData',
                path: 'data/ZOOM_HighLevel_CITY.geojson',
                geoKey: 'CCSUID',
                dataKey: 'L01_CITY',
                minzoom: 5,
                maxzoom: 8,
                // zoomVisibility: [5, 8],
                accessor: {
                    metric: 'PRICE_BY_SQMETER',
                    type: 'NUMBER',
                    aggregation: 'median',
                    unit: '$/m2',
                },
                visibility: true,
            },
            {
                name: 'municipalData',
                path: 'data/ZOOM_MedLevel_Municipality.geojson',
                geoKey: 'IDMAP',
                dataKey: 'L02_MUNI',
                minzoom: 8,
                maxzoom: 10,
                // zoomVisibility: [8, 10],
                accessor: {
                    metric: 'PRICE_BY_SQMETER',
                    type: 'NUMBER',
                    aggregation: 'median',
                    unit: '$/m2',
                },
                visibility: true,
            },
            {
                name: 'zipData',
                path: 'data/ZOOM_LOWLevel_3Digit.geojson', // path to postal code boundary
                geoKey: 'CFSAUID', // key used in geoJSON >> null if no data merge required
                dataKey: 'L03_3DPC', // key used in data file
                // zoomVisibility: [10, 13],
                minzoom: 10,
                maxzoom: 13,
                accessor: {
                    metric: 'PRICE_BY_SQMETER',
                    type: 'NUMBER', // [NUMBER, CURRENCY]
                    aggregation: 'median',
                    unit: '$/m2',
                },
                visibility: true,
            },

        ],
        eventCallback: mapEvents,
    };
    const map = new MapCCV(payload);
    map.create();

    GUI.create({ map });

    Buttons.addListeners(map);
};

document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});

const mapEvents = (obj) => {
    const log = document.getElementById('log');
    log.innerHTML = `<span>${obj.message} (${obj.type} | ${obj.value})</span>${log.innerHTML}`;
};
