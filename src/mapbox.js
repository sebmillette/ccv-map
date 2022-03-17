import mapboxgl from 'mapbox-gl';

import { Layers } from './layers/layers';
import { ZipLayer } from './layers/zipLayer';
import { Scales } from './scales';

export const Map = {
    draw({ payload }) {
        mapboxgl.accessToken = payload.MAPBOX_API;

        const map = new mapboxgl.Map({
            container: payload.id,
            style: `mapbox://styles/mapbox/${payload.map.style}`,
            center: payload.map.geoCenter,
            zoom: payload.map.zoom,
            pitch: Scales.pitchScale(payload.map.zoom),
            bearing: 0,
            antialias: true,
            flying: false,
        });
        map.flying = false;

        map.on('load', () => {
            map.addSource('locations', {
                type: 'geojson',
                data: payload.locationData,
            });

            map.addSource('zipData', {
                type: 'geojson',
                data: payload.geo.zipData,
            });

            Layers.buildings({ map });
            Layers.dots({ map, payload });
            ZipLayer.add({ map, payload });
        });

        map.on('moveend', (e) => {
            if (map.flying) map.flying = false;
        });

        map.on('zoom', () => {
            if (map.flying) return;
            const currentZoom = map.getZoom();
            const pitch = Scales.pitchScale(currentZoom);
            map.setPitch(pitch);
        });
        return map;
    },
};
