import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { Map } from './mapbox';
import { Data } from './data';
import { Scales } from './scales';
import { Tools } from './tools';
import { Colors } from './colors';

import { arrayToFeature } from './arrayToFeature';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
        this.eventCallback = payload.eventCallback;
        this.appState = { type: 'status', value: 'success', message: 'Class created' };
        payload.appState = this.appState;
    }

    async create() {
        this.appState = { type: 'status', value: 'success', message: 'create' };
        const payload = this.payload;

        // geo center
        payload.map.geoCenterValue = Data.calculateGeoCenter({ payload });

        // Process all layers
        const promises = payload.layers.map(async (layerInfo) => {
            try {
                const response = await Data.loadGeo({ layerInfo });
                this.appState = { type: 'status', value: 'success', message: `Layer ${layerInfo.name} loaded` };
                return response;
            } catch (error) {
                this.appState = { type: 'status', value: 'error', message: error };
                return '';
            }
        });
        payload.layerData = await Promise.all(promises);

        this.mapObject = Map.draw({ payload, MapCCV: this });
    }

    update({ property, value }) {
        switch (property) {
        case 'style':
            console.log('update style');
            this.mapObject.setStyle(`mapbox://styles/mapbox/${value}`);
            break;
        case 'location':
            console.log('fly to...');
            // merge new location settings with payload
            this.payload.map.geoCenter = Data.calculateGeoCenter({ payload: this.payload });
            this.flyToCenter({ center: this.payload.map.geoCenter, zoom: this.payload.map.zoom });
            break;

        default:
            break;
        }
    }

    flyToFeature({ JSONfeature }) {
        // Find feature
        const layer = this.payload.layerData.find((d) => d[JSONfeature.id] && d[JSONfeature.id].features.length > 0);
        if (!layer) return;

        // eslint-disable-next-line max-len
        const feature = layer[JSONfeature.id].features.find((p) => p.properties[JSONfeature.key].toString() === JSONfeature.value.toString());
        if (!feature) return;

        const bounds = Tools.calculateBounds({ feature });
        this.mapObject.fitBounds(bounds);
    }

    flyToSelectedFeature() {
        if (!this.selectedBounds) {
            this.appState = { type: 'system', value: 'error', message: 'no feature is currently selected.' };
            return;
        }
        this.mapObject.fitBounds(this.selectedBounds); // , { linear: true, pitch: 45 }
    }

    flyToCenter({ center, zoom }) {
        this.mapObject.flyTo({
            center,
            zoom,
            speed: 1.2,
            // pitch: Scales.pitchScale(this.payload.map.zoom),
            easing(t) {
                return t;
            },
            essential: true,
        });
        this.mapObject.flying = true;
    }

    updateLayers() {
        this.payload.layers.forEach((layer) => {
            const visibility = layer.visibility ? 'visible' : 'none';
            this.mapObject.setLayoutProperty(
                `${layer.name}Fill`,
                'visibility',
                visibility,
            );

            // lines
            this.mapObject.setLayoutProperty(
                `${layer.name}`,
                'visibility',
                visibility,
            );

            // zoom
            const minzoom = layer.minzoom;
            const maxzoom = layer.maxzoom;

            this.mapObject.setLayerZoomRange(`${layer.name}Fill`, minzoom, maxzoom);
            this.mapObject.setLayerZoomRange(`${layer.name}`, minzoom, maxzoom);

            // colors
            const layerData = this.payload.layerData.find((d) => d[layer.name])[layer.name].features;

            const fillColorSteps = Colors.paintSteps({
                layerData,
                layerProperties: this.payload.layerProperties,
                layer,
            });

            this.mapObject.setPaintProperty(`${layer.name}Fill`, 'fill-color', fillColorSteps);
        });
    }

    scaleColorsToScreen() {
        this.payload.layers.forEach((layer) => {
            const features = this.mapObject.querySourceFeatures(layer.name, {
                sourceLayer: `${layer.name}Fill`,
            });

            if (features.length === 0) return; // hidden layer will not be updated
            const fillColorSteps = Colors.paintSteps({
                layerData: features,
                layerProperties: this.payload.layerProperties,
                layer,
            });
            this.mapObject.setPaintProperty(`${layer.name}Fill`, 'fill-color', fillColorSteps);
        });
    }

    set appState(obj) {
        if (!this.eventCallback) return;
        this.eventCallback(obj);
    }
}
