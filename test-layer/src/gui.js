import * as dat from 'dat.gui';
import { async } from 'regenerator-runtime';

export const GUI = {
    create({ map, metroData }) {
        const payload = map.payload;
        const gui = new dat.GUI();
        gui.open();
        gui.width = 250;

        // MAP SECTION
        const mapSection = gui.addFolder('Map');
        mapSection.close();

        mapSection
            .add(payload.map, 'style', { Light: 'light-v10', Dark: 'dark-v10' })
            .onChange((value) => {
                map.update({ property: 'style', value });
            });
        mapSection
            .add(payload.map, 'geoCenterType', {
                'Data Center': 'dataCenter', Manual: 'manual', 'Data Bound': 'dataBound',
            });
        mapSection
            .add(payload.map, 'geoCenterString');
        mapSection
            .add(payload.map, 'zoom');
        mapSection
            .add(payload.map, 'currentZoom').listen();

        // ### LAYER SECTION ###
        const layerSection = gui.addFolder('Shape Layers');
        layerSection.close();

        const updateBtn = { 'Update Layers': () => {
            map.updateLayers();
        } };
        layerSection.add(updateBtn, 'Update Layers');

        const updateColors = { 'Adapt Colors to Screen Selection': () => {
            map.scaleColorsToScreen();
        } };
        layerSection.add(updateColors, 'Adapt Colors to Screen Selection');

        layerSection.add(payload.layerProperties, 'segmentAmount');

        // colors
        const colors = {};
        payload.layerProperties.segmentColors.forEach((layer, index) => {
            colors[`color ${index + 1}`] = layer;
            layerSection.addColor(colors, `color ${index + 1}`)
                .onChange((value) => {
                    payload.layerProperties.segmentColors[index] = value;
                });
        });

        // scale
        layerSection.add(payload.layerProperties, 'scaleType', { Quantile: 'quantile', Quantize: 'quantize' });

        const layerData = [];

        payload.layers.forEach((layer, index) => {
            layerData.push(layerSection.addFolder(layer.name));
            layerData[index]
                .open();
            layerData[index]
                .add(layer, 'visibility')
                .onChange(() => {
                    map.updateLayers();
                });
            layerData[index]
                .add(layer, 'minzoom');
            layerData[index]
                .add(layer, 'maxzoom');
            layerData[index]
                .add(layer, 'metricAccessor');
        });

        // ### BUTTONS ###
        const actionSection = gui.addFolder('Actions');
        actionSection.close();

        // Fly-to zoom / center
        const sampleCenterValue = JSON.stringify({ zoom: 10, lat: -73.595, long: 45.488 });
        const customCenter = { sampleCenterValue };

        const flyBtn = { 'fly to center': () => {
            const center = payload.map.geoCenterString.split(',').map((d) => Number(d));
            map.flyToCenter({ center, zoom: payload.map.zoom });
        } };
        actionSection.add(flyBtn, 'fly to center');

        // Fly-to selected feature
        const flyToSelection = { 'fly to selected feature': () => {
            map.flyToSelectedFeature({ geoPadding: [20, 20, 20, 20] }); // west, north, east, south
        } };
        actionSection.add(flyToSelection, 'fly to selected feature');

        // Fly-to custom feature
        const sampleFeatureValue = JSON.stringify({ id: 'lowLevelData', key: 'UNIQUE_ID', value: '2' });
        const customFeature = { sampleFeatureValue };
        actionSection
            .add(customFeature, 'sampleFeatureValue');

        const flyToFeature = { 'fly to sample feature': () => {
            const JSONfeature = JSON.parse(customFeature.sampleFeatureValue);
            map.flyToFeature({ JSONfeature });
        } };
        actionSection.add(flyToFeature, 'fly to sample feature');

        // ### INFO BUTTONS ###
        const placesSection = gui.addFolder('Places');
        placesSection.open();
        const places = {
            Configuration: 'murales',
            Set: 'g1',
            Zoom: 17,
            latitude: '', //  45.508888
            longitude: '', // -73.561668
            radius: 1000,
            maxItems: 50,
        };

        placesSection.add(places, 'Configuration', {
            Murales: 'murales',
            'Murales (2019-2021)': 'muralesYear',
            'Murales (2016-2018)': 'muralesYear2',
            // 'POI Layer': 'poi_all',
            // 'Transit Layer': 'transit',
            // 'Selected POI + stops': 'poi_label',
            // 'Metro stations': 'metro',
            // 'Bixi Stations': 'bixi',
        });

        placesSection.add(places, 'Set', {
            'Group 1': 'g1',
            'Group 2': 'g2',
        });

        placesSection.add(places, 'latitude');
        placesSection.add(places, 'longitude');
        placesSection.add(places, 'radius');
        placesSection.add(places, 'maxItems');

        const centerShow = { 'show group': () => {
            const infoLayerData = {
                latitude: places.latitude,
                longitude: places.longitude,
                maxItems: places.maxItems,
                radius: places.radius,
                visibleLayers: visibleLayers[places.Configuration],
                infoIconPath: '/assets/icons/',
                tileset: 'spandl.9s7tnsby',
                id: places.Set,
            };

            map.infoLayer.create({
                infoLayerData,
                MAPBOX_API: payload.MAPBOX_API,
                map: map.mapObject,
            });
        } };
        placesSection.add(centerShow, 'show group');

        // Remove Layer
        const removeLayer = { 'remove group': () => {
            map.infoLayer.removeMarker({
                map: map.mapObject,
                id: places.Set,
            });
        } };
        placesSection.add(removeLayer, 'remove group');

        // Add GeoJSON  Layer
        const drawGeoJSON = { 'draw GeoJSON': () => {
            map.infoLayer.drawGeoJSON({
                map: map.mapObject,
                geoJSON: metroData,
                infoLayerData: {
                    id: 'metro',
                    minzoom: 13,
                    maxzoom: 22,
                    defaultLineWidth: 6,
                    defaultLineColor: 'pink',
                    circleRadius: 5,
                    circleColor: 'pink',
                    strokeColor: 'slategrey',
                    strokeWidth: 1,
                    opacity: 1,

                },
            });
        } };
        placesSection.add(drawGeoJSON, 'draw GeoJSON');

        // Remove GeoJSON Layer
        const removeGeoJSON = { 'remove GeoJSON': () => {
            map.infoLayer.removeGeoJSON({
                map: map.mapObject,
                id: 'metro',
            });
        } };
        placesSection.add(removeGeoJSON, 'remove GeoJSON');
    },
};

const visibleLayers = {
    poi_label: [
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
                    station: 'station.png',
                    stop: 'stop.png',
                } },
        { layer: 'landuse',
            selectionKey: 'class' },
    ],
    poi_all: [
        { layer: 'poi_label' },
    ],
    murales: [
        { layer: 'murales-4d22r0' },
    ],
    muralesYear: [
        { layer: 'murales-4d22r0',
            selectionKey: 'annee',
            icons:
            {
                2021: 'm21.png',
                2020: 'm20.png',
                2019: 'm19.png',
            } },

    ],
    muralesYear2: [
        { layer: 'murales-4d22r0',
            selectionKey: 'annee',
            icons:
            {
                2018: 'm18.png',
                2017: 'm17.png',
                2016: 'm16.png',
            } },

    ],
    metro: [
        { layer: 'transit_stop_label',
            selectionKey: 'stop_type',
            icons:
                {
                    station: 'station.png',
                } },
    ],
    bixi: [
        { layer: 'poi_label',
            selectionKey: 'maki',
            icons:
                {
                    bicycle: 'station.png',
                } },
    ],
    transit: [
        { layer: 'transit_stop_label' },
    ],
};
