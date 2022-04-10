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
            style: 'spandl/cl1tf9mgp003i14s2rul8tegf', // mapbox/light-v10
            zoom: 5,
            currentZoom: 5,
            geoCenterType: 'manual', // [manual, dataBound, dataCenter]
            geoCenterString: '-73.595, 45.488',
            showBuildings: true,
        },
        data: {
            // locationPath: 'data/QC_CONDO_SOLD_METRIC.geojson', // GeoJSON with properties
            // showAsLayer: true,
            minzoom: 15,
            maxzoom: 20,
            metricAccessor: 'SQFt_mdn',
        },
        layerProperties: {
            segmentAmount: 24,
            segmentColors: ['#d3ffcc', '#dee06c', '#d90421'],
        },
        layers: [
            {
                name: 'cityData',
                geoJSON: 'data/ZOOM_HighLevel_CITY.geojson',
                data: 'data/sold_basickpi_level_01_high_condo.json',
                geoKey: 'CCSUID',
                // dataKey: 'L01_CITY',
                minzoom: 5,
                maxzoom: 8,
                metricAccessor: 'SQFt_mdn',
                visibility: true,
            },
            {
                name: 'municipalData',
                geoJSON: 'data/ZOOM_MedLevel_Municipality.geojson',
                data: 'data/sold_basickpi_level_02_med_condo.json',
                geoKey: 'UPKYID',
                // dataKey: 'L02_MUNI',
                minzoom: 8,
                maxzoom: 12,
                metricAccessor: 'SQFt_mdn',
                visibility: true,
            },
            // {
            //     name: 'zipData',
            //     geoJSON: 'data/ZOOM_LOWLevel_3Digit.geojson', // path to postal code boundary
            //     data: 'data/sold_basickpi_level_03_low_condo.json',
            //     geoKey: 'CFSAUID', // key used in geoJSON >> null if no data merge required
            //     // dataKey: 'L03_3DPC', // key used in data file
            //     minzoom: 10,
            //     maxzoom: 13,
            //     metricAccessor: 'SQFt_mdn',
            //     visibility: true,
            // },

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
