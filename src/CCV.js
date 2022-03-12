import { Map } from './mapbox';
import { Data } from './data';
import 'mapbox-gl/dist/mapbox-gl.css';
import { arrayToFeature } from './arrayToFeature';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
        this.init();
    }

    init() {
        this.payload.geoCenter = [-73.595717, 45.488102];
        console.log(this);
    }

    async create() {
        const rawData = await Data.load({ path: this.payload.data.path });
        this.payload.metricExtent = [100, 10000000];

        const data = arrayToFeature.process({ data: rawData.locations });
        this.payload.data = data;
        this.mapObject = Map.draw({ payload: this.payload });
    }

    update({ property, value }) {
        this.init();
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
