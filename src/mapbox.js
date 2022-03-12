import mapboxgl from 'mapbox-gl';

export const Map = {
    draw({ payload }) {
        mapboxgl.accessToken = payload.MAPBOX_API;
        const map = new mapboxgl.Map({
            container: payload.id,
            style: `mapbox://styles/mapbox/${payload.map.style}`,
            center: payload.geoCenter,
            zoom: 14,
            pitch: 45,
            bearing: -17.6,
            antialias: true,
        });

        const addDots = () => {
            map.addLayer(
                {
                    id: 'dots-locations',
                    type: 'circle',
                    source: 'locations',
                    minzoom: 4,
                    paint: {
                    // increase the radius of the circle as the zoom level and dbh value increases
                        'circle-radius': {
                            property: 'metric',
                            type: 'exponential',
                            stops: [
                                [{ zoom: 16, value: payload.metricExtent[0] }, 8],
                                [{ zoom: 16, value: payload.metricExtent[1] }, 8],
                                [{ zoom: 20, value: payload.metricExtent[0] }, 30],
                                [{ zoom: 20, value: payload.metricExtent[1] }, 30],
                            ],
                        },
                        'circle-color': {
                            property: 'metric',
                            type: 'exponential',
                            stops: [
                                [payload.metricExtent[0], 'rgb(255,255,255)'],
                                [payload.metricExtent[1], 'rgb(184, 0, 92)'],
                            ],
                        },
                        'circle-stroke-color': 'white',
                        // 'circle-stroke-width': 1,
                        'circle-opacity': {
                            stops: [
                                [12, 0],
                                [15, 1],
                            ],
                        },
                    },
                },
                'waterway-label',
            );
        };

        map.on('load', () => {
            map.addSource('locations', {
                type: 'geojson',
                data: payload.data,
            });

            addDots();
        });

        return map;
    },
};
