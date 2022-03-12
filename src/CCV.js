import { Map } from './mapbox';
import { Data } from './data';
import 'mapbox-gl/dist/mapbox-gl.css';
import { arrayToFeature } from './arrayToFeature';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
    }

    async create() {
        const payload = this.payload;
        // Data
        const rawData = await Data.load({ path: payload.data.path });
        const data = arrayToFeature.process({ data: rawData.locations });
        payload.data = data;

        // geo center
        payload.geoCenter = Data.calculateGeoCenter({ payload });

        // data properties
        payload.metricExtent = Data.calculateMetricExtent({ payload });

        this.mapObject = Map.draw({ payload });
    }

    update({ property, value }) {
        switch (property) {
        case 'style':
            console.log('update style');
            this.mapObject.setStyle(`mapbox://styles/mapbox/${value}`);
            break;

        default:
            break;
        }
    }
}
