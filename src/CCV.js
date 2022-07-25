import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as d3 from 'd3';

import { Map } from './mapbox';
import { Data } from './data';
import { Tools } from './tools';
import { Colors } from './colors';
import { infoLayer } from './layers/infoLayer';
import { ZipLayer } from './layers/zipLayer';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
        this.eventCallback = payload.eventCallback;
        this.appState = { type: 'status', value: 'success', message: 'Class created' };
        payload.appState = this.appState;
        this.infoLayer = infoLayer;
    }

    async create() {
        const createMap = async () => {
            this.appState = { type: 'status', value: 'success', message: 'create' };
            const payload = this.payload;

            // geo center
            payload.map.geoCenterValue = Data.calculateGeoCenter({ payload });

            // console.log('payload.layers (anything empty here?)', payload.layers);

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

            this.mapObject = await Map.draw({ payload, MapCCV: this });
            return true;
        };

        return new Promise((resolve) => {
            resolve(createMap());
        });
    }

    update({ property, value }) {
        switch (property) {
        case 'style':
            this.mapObject.setStyle(`mapbox://styles/mapbox/${value}`);
            break;
        case 'location':
            // merge new location settings with payload
            this.payload.map.geoCenter = Data.calculateGeoCenter({ payload: this.payload });
            this.flyToCenter({ center: this.payload.map.geoCenter, zoom: this.payload.map.zoom });
            break;

        default:
            break;
        }
    }

    flyToFeature({ JSONfeature, geoPadding = [0, 0, 0, 0] }) {
        // Find feature
        const layer = this.payload.layerData.find((d) => d[JSONfeature.id] && d[JSONfeature.id].features.length > 0);
        if (!layer) return;

        const feature = layer[JSONfeature.id].features.find((p) => p.properties[JSONfeature.key].toString()
            === JSONfeature.value.toString());

        if (!feature) return;

        const bounds = Tools.calculateBounds({ feature });

        this.mapObject.fitBounds(bounds);
    }

    flyToSelectedFeature({ geoPadding = [0, 0, 0, 0] }) {
        if (!this.selectedBounds) {
            this.appState = { type: 'system', value: 'error', message: 'no feature is currently selected.' };
            return;
        }

        const paddedFeature = this.boundPadding(this.selectedBounds, geoPadding);

        // this.mapObject.fitBounds(this.selectedBounds); // , { linear: true, pitch: 45 }
        this.mapObject.fitBounds(paddedFeature); // , { linear: true, pitch: 45 }
    }

    centerSelectedFeature() {
        if (!this.selectedBounds) {
            this.appState = { type: 'system', value: 'error', message: 'no feature is currently selected.' };
            return;
        }

        const bounds = this.selectedBounds;
        const latDiff = Math.abs(bounds._sw.lat - bounds._ne.lat);
        const lngDiff = Math.abs(bounds._ne.lng - bounds._sw.lng);
        const latMin = d3.min([bounds._sw.lat, bounds._ne.lat]);
        const lngMin = d3.min([bounds._ne.lng, bounds._sw.lng]);

        const lat = latMin + latDiff / 2;
        const lng = lngMin + lngDiff / 2;
        // move map to the center of this bound

        const center = [lng, lat];
        const zoom = this.mapObject.getZoom();
        // center: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 100],
        this.flyToCenter.call(this, { center, zoom });
    }

    // eslint-disable-next-line class-methods-use-this
    boundPadding(bounds, padding) {
        // somehow the direction sw / ne is not correct
        // the result now is west, north, east, south
        const top = Number.isNaN(padding[0]) ? 0 : padding[0] / 100;
        const right = Number.isNaN(padding[1]) ? 0 : padding[1] / 100;
        const bottom = Number.isNaN(padding[2]) ? 0 : padding[2] / 100;
        const left = Number.isNaN(padding[3]) ? 0 : padding[3] / 100;

        const adjustObject = () => {
            const width = Math.abs(bounds._sw.lat - bounds._ne.lat);
            const height = Math.abs(bounds._ne.lng - bounds._sw.lng);

            bounds._sw.lng += height * bottom;
            bounds._ne.lng -= height * top;

            bounds._sw.lat -= width * left;
            bounds._ne.lat += width * right;

            return bounds;
        };

        const adjustArray = () => {
            const sw = [bounds._sw.lat, bounds._sw.lng];
            const ne = [bounds._ne.lat, bounds._ne.lng];

            return [sw, ne];
        };

        const newBounds = typeof bounds === 'object' ? adjustObject() : adjustArray();
        return newBounds;
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

            const lineColorSteps = Colors.paintSteps({
                layerData,
                layerProperties: this.payload.layerProperties,
                layer,
                darken: true,
            });

            this.mapObject.setPaintProperty(`${layer.name}Fill`, 'fill-color', fillColorSteps);
            this.mapObject.setPaintProperty(`${layer.name}`, 'line-color', lineColorSteps);
        });
    }

    removeLayerHighlights() {
        const map = this.mapObject;
        ZipLayer.removeLayerHighlights({ map });
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
        obj.currentZoom = this.payload.map.currentZoom;
        this.eventCallback(obj);
    }
}
