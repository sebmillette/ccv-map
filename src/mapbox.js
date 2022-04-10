import mapboxgl from 'mapbox-gl';

import { Buildings } from './layers/buildingLayers';
import { ZipLayer } from './layers/zipLayer';
import { DataDots } from './layers/dataLayer';
import { Scales } from './scales';

export const Map = {
    get currentZoom() {
        return Map.map.getZoom();
    },

    draw({ payload, MapCCV }) {
        mapboxgl.accessToken = payload.MAPBOX_API;
        MapCCV.appState = { type: 'status', value: 'success', message: 'MapBox token OK' };

        const value = payload.map.geoCenterValue;

        const map = new mapboxgl.Map({
            container: payload.id,
            style: `mapbox://styles/mapbox/${payload.map.style}`,
            center: payload.map.geoCenterType === 'dataBound' ? [0, 0] : payload.map.geoCenterValue,
            zoom: payload.map.zoom,
            bounds: payload.map.geoCenterType === 'dataBound' ? value : null,
            pitch: Scales.pitchScale(payload.map.zoom), // payload.map.zoom
            bearing: 0,
            antialias: true,
            flying: false,
            minZoom: 6,
            maxZoom: 18,
        });

        map.flying = false;
        map.tooltip = null;
        map.MapCCV = MapCCV;

        map.on('load', () => {
            // map.addSource('locations', {
            //     type: 'geojson',
            //     data: payload.locationData,
            // });

            if (payload.map.showBuildings) Buildings.add({ map });
            // if (payload.data.showAsLayer) DataDots.add({ map, payload });
            payload.layerData.forEach((layer, index) => {
                ZipLayer.add({ map, payload, layer, index });
            });
        });

        map.on('zoomstart', () => {
            if (map.tooltip === null) return;

            // remove tooltip
            map.tooltip.remove();
            map.tooltip = null;

            // reset layer state
            map.hoveredStateId = null;
            map.clickStateId = null;

            // remove bound
            map.MapCCV.selectedBounds = null;

            payload.layers.forEach((layer) => {
                map.removeFeatureState({
                    source: layer.name,
                });
            });
        });

        // map.on('moveend', (e) => {
        //     if (map.flying) map.flying = false;
        // });

        map.on('zoom', () => {
            const currentZoom = map.getZoom();
            map.MapCCV.payload.map.currentZoom = currentZoom;
            // if (map.flying) return;
            // const pitch = Scales.pitchScale(currentZoom);
            // map.setPitch(pitch);
        });

        // this.createAppState({ type: 'status', value: 'success', message: 'Layers loaded' });
        return map;
    },
};
