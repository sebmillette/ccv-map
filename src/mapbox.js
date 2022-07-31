import mapboxgl from 'mapbox-gl';

import { Buildings } from './layers/buildingLayers';
import { ZipLayer } from './layers/zipLayer';

export const Map = {
    get currentZoom() {
        return Map.map.getZoom();
    },

    async draw({ payload, MapCCV }) {
        mapboxgl.accessToken = payload.MAPBOX_API;
        MapCCV.appState = { type: 'status', value: 'success', message: 'MapBox token OK' };

        const value = payload.map.geoCenterValue;

        const map = new mapboxgl.Map({
            container: payload.id,
            style: `mapbox://styles/${payload.map.style}`,
            center: payload.map.geoCenterType === 'dataBound' ? [0, 0] : payload.map.geoCenterValue,
            zoom: payload.map.zoom,
            bounds: payload.map.geoCenterType === 'dataBound' ? value : null,
            bearing: 0,
            antialias: true,
            flying: false,
            minZoom: payload.map.minZoom ? payload.map.minZoom : 5,
            maxZoom: payload.map.maxZoom ? payload.map.maxZoom : 20,
        });

        map.flying = false;
        map.tooltip = null;
        map.MapCCV = MapCCV;

        map.on('load', () => {
            if (payload.map.showBuildings) Buildings.add({ map });
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

        map.on('zoom', () => {
            const currentZoom = map.getZoom();
            map.MapCCV.payload.map.currentZoom = currentZoom;
        });

        return map;
    },
};
