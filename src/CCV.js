import 'mapbox-gl/dist/mapbox-gl.css';
import { Map } from './mapbox';
import { Data } from './data';
import { Scales } from './scales';

import { arrayToFeature } from './arrayToFeature';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
    }

    async create() {
        const payload = this.payload;
        // Data
        const rawData = await Data.load({ path: payload.data.path });
        const data = arrayToFeature.process({ data: rawData.locations, properties: ['metric', 'id'] });
        payload.data = data;

        // geo center
        payload.map.geoCenter = Data.calculateGeoCenter({ payload });

        // data properties
        payload.metricExtent = Data.calculateMetricExtent({ payload });

        // geo layers
        payload.geo = await Data.loadGeo();

        this.mapObject = Map.draw({ payload });
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
}
