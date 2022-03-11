import { Map } from './mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export class MapCCV {
    constructor(payload) {
        this.payload = payload;
        this.init();
    }

    init() {
        console.log(this);
        this.geoCenter = [-73.595717, 45.488102];
    }

    create() {
        console.log(this);
        this.mapObject = Map.draw({
            geoCenter: this.geoCenter,
            MAPBOX_API: this.payload.MAPBOX_API,
            id: this.payload.id,
        });

    }
    
    update({property, value}) {
        this.init();
        switch (property) {
            case 'style':
                console.log('update style')
                this.mapObject.setStyle('mapbox://styles/mapbox/' + value);                
                break;
        
            default:
                break;
        }
    }
}
