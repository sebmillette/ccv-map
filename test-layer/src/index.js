/* eslint-disable no-restricted-syntax */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as _ from 'lodash';
import * as d3 from 'd3';
import 'mapbox-gl/dist/mapbox-gl.css';

import config from '../config.json';
import { MapCCV } from '../../src/CCV';
import { GUI } from './gui';
import { Buttons } from './btn-scripts';

import './css/base.scss';

const loadMap = async () => {
    const containerId = 'dev-map';

    // load one file to test passing object directly
    const highLevelDataPath = 'data/sold_basickpi_level_01_high_condo.json';
    const highLevelGeoPath = 'data/LEVEL_HIGH.geojson';
    const geoJSON = await d3.json(highLevelGeoPath);
    const geoData = await d3.json(highLevelDataPath);

    // See Documentation:
    // https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/

    // other possibilities for poi_label
    // ['store_like', 'park_like', 'lodging',
    // 'education', 'arts_and_entertainment, 'sport_and_leisure', 'building', 'medical']

    // other possibilities for transit_stop_label
    // ['entrance', 'stop']

    const visibleLayers = [
        { layer: 'poi_label',
            selectionKey: 'class',
            icons: {
                food_and_drink_stores: 'food_and_drink_stores.png',
                food_and_drink: 'food_and_drink.png',
                commercial_services: 'commercial_services.png',
                education: 'education.png',
            } },
        { layer: 'transit_stop_label',
            selectionKey: 'stop_type',
            icons:
                {
                    station: 'metro.png',
                    stop: 'stop.png',
                } },
        { layer: 'landuse',
            selectionKey: 'class' },
    ];
    const infoIconPath = '/assets/icons/';

    const payload = {
        MAPBOX_API: config.MAPBOX_API,
        id: containerId,
        map: {
            style: 'spandl/cl1tf9mgp003i14s2rul8tegf', // mapbox/light-v10
            zoom: 9,
            currentZoom: 9,
            geoCenterType: 'manual', // [manual, dataBound, dataCenter]
            geoCenterString: '-73.5681, 45.5186',
            showBuildings: true,
            minZoom: 9,
            maxZoom: 15,
        },
        infoLayerData: {
            latitude: '-73.5681',
            longitude: '45.5186',
            maxItems: 50,
            radius: 1000,
            visibleLayers,
            infoIconPath,
        },
        layerProperties: {
            segmentAmount: 24,
            segmentColors: ['#faffdc', '#f5da73', '#015b91'],
            scaleType: 'quantize', // [quantile, quantize]
            // Other possible color schemes
            // '#faffdc', '#e3c745', '#0168a2' >> yellow - blue
            // '#cbedc4', '#eddc2f', '#d91d04' >> yellow - red
            // '#ddf5f5', '#72e8cc', '#f01064' >> green pink
        },
        layers: [
            {
                name: 'cityData',
                geoJSON: highLevelGeoPath,
                data: geoData,
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
    const mapIsCreated = await map.create();

    if (!mapIsCreated) {
        console.error('failed to create map');
        return;
    }

    const metroData = await d3.json('data/metromap.json');
    map.infoLayer.drawGeoJSON({
        map: map.mapObject,
        geoJSON: metroData,
        infoLayerData: {
            id: 'metro',
            minzoom: 13,
            maxzoom: 22,
            lineWidth: 2,
            lineColor: 'pink',
            circleRadius: 6,
            circleColor: 'white',
            strokeColor: 'black',
            strokeWidth: 2,
            opacity: 0.7,

        },
    });

    GUI.create({ map, metroData });

    Buttons.addListeners(map);

    // EXAMPLE: HOW TO RESIZE THE MAP
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target.id === containerId) {
                if (!map.mapObject) return; // may take some time until map is created
                map.mapObject.resize();
            }
        }
    });

    const divElem = document.querySelector(`#${containerId}`);
    resizeObserver.observe(divElem);
    // EXAMPLE: HOW TO RESIZE THE MAP >> END
};
document.addEventListener('DOMContentLoaded', () => {
    loadMap();
});

const mapEvents = (obj) => {
    const log = document.getElementById('log');
    // attach new message on top

    if (obj.data) {
        Object.keys(obj.data).forEach((key) => {
            log.innerHTML = `<span style="color: slategrey;">
            ${key}: ${obj.data[key]}
            </span>${log.innerHTML}`;
        });
    }
    log.innerHTML = `<span>${obj.message} (${obj.type} | ${obj.value} | zoom: ${obj.currentZoom})</span>
    ${log.innerHTML}`;
};
