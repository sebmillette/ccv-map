import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as _ from 'lodash';
import 'mapbox-gl/dist/mapbox-gl.css';

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
            style: 'spandl/cl1tf9mgp003i14s2rul8tegf', // mapbox/light-v10
            zoom: 7,
            currentZoom: 5,
            geoCenterType: 'manual', // [manual, dataBound, dataCenter]
            geoCenterString: '-73.595, 45.688',
            showBuildings: true,
        },
        layerProperties: {
            segmentAmount: 24,
            segmentColors: ['#faffdc', '#f5da73', '#015b91'],
            // Other possible color schemes
            // '#faffdc', '#e3c745', '#0168a2' >> yellow - blue
            // '#cbedc4', '#eddc2f', '#d91d04' >> yellow - red
            // '#ddf5f5', '#72e8cc', '#f01064' >> green pink
        },
        layers: [
            {
                name: 'cityData',
                geoJSON: 'data/LEVEL_HIGH.geojson',
                data: 'data/sold_basickpi_level_01_high_condo.json',
                geoKey: 'CCSUID',
                minzoom: 5,
                maxzoom: 8,
                metricAccessor: 'SQFt_mdn',
                visibility: true,
            },
            {
                name: 'municipalData',
                geoJSON: 'data/LEVEL_MED.geojson',
                data: 'data/sold_basickpi_level_02_med_condo.json',
                geoKey: 'UPKYID',
                minzoom: 8,
                maxzoom: 10,
                metricAccessor: 'SQFt_mdn',
                visibility: true,
            },
            {
                name: 'lowLevelData',
                geoJSON: 'data/LEVEL_LOW.geojson', // path to geojson
                data: 'data/sold_basickpi_level_03_low_condo.json', // path to data file
                geoKey: 'UNIQUE_ID', // key to merge
                minzoom: 10,
                maxzoom: 13,
                metricAccessor: 'SQFt_mdn',
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
