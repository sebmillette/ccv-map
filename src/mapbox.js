import mapboxgl from 'mapbox-gl';

export const Map = {
    draw({ geoCenter, MAPBOX_API, id }) {
        mapboxgl.accessToken = MAPBOX_API;
        const map = new mapboxgl.Map({
            container: id,
            style: 'mapbox://styles/mapbox/dark-v10',
            center: geoCenter,
            zoom: 14,
            pitch: 45,
            bearing: -17.6,
            antialias: true,
        });
    },
};
