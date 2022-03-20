import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from './mapbox';
import { Data } from './data';
import { Scales } from './scales';

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

        // Data
        const data = await Data.load({ path: payload.data.locationPath });
        payload.locationData = data;

        this.appState = { type: 'status', value: 'success', message: 'Location data loaded' };

        // geo center
        payload.map.geoCenterValue = Data.calculateGeoCenter({ payload });

        // Process all layers
        const promises = payload.layers.map(async (layerInfo) => {
            try {
                const response = await Data.loadGeo({ layerInfo, locationData: data });
                return response;
            } catch (error) {
                this.appState = { type: 'status', value: 'error', message: error };
                return '';
            }
        });
        payload.layerData = await Promise.all(promises);

        this.appState = { type: 'status', value: 'success', message: 'All layer data loaded' };

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
            console.log(this.payload.map.geoCenter);
            this.mapObject.flyTo({
                center: this.payload.map.geoCenter,
                zoom: this.payload.map.zoom,
                speed: 1.2,
                pitch: Scales.pitchScale(this.payload.map.zoom),
                easing(t) {
                    return t;
                },
                essential: true,
            });
            this.mapObject.flying = true;
            break;

        default:
            break;
        }
    }

    set appState(obj) {
        if (!this.eventCallback) return;
        this.eventCallback(obj);
    }
}
