import * as d3 from 'd3';
import mapboxgl from 'mapbox-gl';

export const infoLayer = {

    /**
     * Draw geoJSON layer
     * Currently supports 'LineString' and 'Point'
     */
    drawGeoJSON({ map, geoJSON, infoLayerData }) {
        const lineId = `line-${infoLayerData.id}`;
        const pointId = `point-${infoLayerData.id}`;

        if (map.getLayer(lineId) || map.getLayer(pointId)) infoLayer.removeGeoJSON({ map, id: infoLayerData.id });

        // defaults and fallbacks
        const minzoom = infoLayerData.minzoom ? infoLayerData.minzoom : 1;
        const maxzoom = infoLayerData.maxzoom ? infoLayerData.maxzoom : 24;

        const addLines = () => {
            const lineWidth = infoLayerData.lineWidth ? infoLayerData.lineWidth : 2;
            const lineColor = infoLayerData.lineColor ? infoLayerData.lineColor : 'slategrey';

            const lines = geoJSON.features.filter((d) => d.geometry.type === 'LineString');

            map.addSource(lineId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: lines,
                },
            });

            map.addLayer({
                id: lineId,
                type: 'line',
                minzoom,
                maxzoom,
                source: lineId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': ['to-color', ['get', 'lineColor'], d3.color(lineColor).formatHex()],
                    'line-width': ['number', ['get', 'lineWidth'], lineWidth],
                },

            });
        };

        const addPoints = () => {
            const circleRadius = infoLayerData.circleRadius ? infoLayerData.circleRadius : 6;
            const circleColor = infoLayerData.circleColor ? infoLayerData.circleColor : 'slategrey';
            const strokeColor = infoLayerData.strokeColor ? infoLayerData.strokeColor : 'black';
            const strokeWidth = infoLayerData.strokeWidth ? infoLayerData.strokeWidth : 2;
            const opacity = infoLayerData.opacity ? infoLayerData.opacity : 1;

            const points = geoJSON.features.filter((d) => d.geometry.type === 'Point');

            map.addSource(pointId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: points,
                },
            });

            map.addLayer(
                {
                    id: pointId,
                    type: 'circle',
                    source: pointId,
                    minzoom,
                    maxzoom,
                    paint: {
                        'circle-radius': ['number', ['get', 'radius'], circleRadius],
                        'circle-color': ['to-color', ['get', 'color'], d3.color(circleColor).formatHex()],
                        'circle-stroke-color': ['to-color', ['get', 'strokeColor'], d3.color(strokeColor).formatHex()],
                        'circle-stroke-width': ['number', ['get', 'strokeWidth'], strokeWidth],
                        'circle-opacity': ['number', ['get', 'opacity'], opacity],
                    },
                },
            );

            map.on('click', pointId, (event) => {
                map.MapCCV.appState = {
                    type: 'user',
                    value: 'click',
                    message: 'clicked on circle',
                    data: event.features[0].properties,
                };
            });

            map.on('mouseenter', pointId, (event) => {
                map.getCanvas().style.cursor = 'pointer';
                map.MapCCV.appState = {
                    type: 'user',
                    value: 'enter',
                    message: 'rollover on circle',
                    data: event.features[0].properties,
                };
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', pointId, () => {
                map.getCanvas().style.cursor = '';
            });
        };

        addLines();
        addPoints();
    },

    removeGeoJSON({ map, id }) {
        const lineId = `line-${id}`;
        const pointId = `point-${id}`;

        if (map.getLayer(lineId)) {
            map.removeLayer(lineId);
            map.removeSource(lineId);
        }

        if (map.getLayer(pointId)) {
            map.removeLayer(pointId);
            map.removeSource(pointId);
        }
    },

    /**
     * fetch data from Tile query API and draw icons on map
     * @infoLayerData {object} contains detailed info about features to draw
     * @MAPBOX_API {string} API key
     */
    async create({ infoLayerData, MAPBOX_API, map }) {
        const { lng, lat } = map.getCenter();

        if (infoLayerData.longitude === '' || !infoLayerData.longitude) infoLayerData.longitude = lng;
        if (infoLayerData.latitude === '' || !infoLayerData.latitude) infoLayerData.latitude = lat;

        const infoFeatures = await infoLayer.getData({ infoLayerData, MAPBOX_API });
        infoLayer.update({ infoLayerData, infoFeatures, map, MAPBOX_API });
    },

    /**
     * filter features by sub category
     * @infoLayerData {object} contains detailed info about features to draw
     * @infoFeatures {geoJSON} all features returned from API
     */
    update({ infoLayerData, infoFeatures, map, MAPBOX_API }) {
        // console.log({ infoLayerData, infoFeatures });

        const { visibleLayers } = infoLayerData;

        // Filter sub-categories
        const filterFeatures = (layer) => {
            const key = layer.selectionKey;

            const groups = layer && layer.icons
                ? Object.keys(layer.icons).map((d) => d)
                : [];

            const selectedFeatures = layer.icons && groups.length > 0
                ? infoFeatures.features.filter((d) => groups.includes(d.properties[key]))
                : infoFeatures.features.filter((d) => d.properties.tilequery.layer === layer.layer);

            selectedFeatures.forEach((feature) => {
                addIconProperties({ layer, feature });
            });

            return selectedFeatures;
        };

        const addIconProperties = ({ layer, feature }) => {
            const key = layer.selectionKey;
            const iconKey = feature.properties[key];
            const icon = typeof key === 'undefined' ? `${layer.layer}.png` : `${layer.icons[iconKey]}`;
            feature.icon = infoLayerData.infoIconPath + icon;
        };

        // Filter only if sub categories are defined + combine features
        const selectedFeatures = visibleLayers.map((layer) => filterFeatures(layer)).flat();
        infoLayer.drawMarker({ infoLayerData, selectedFeatures, map, MAPBOX_API });
    },

    /**
     * draw markers on screen
     * @selectedFeatures {geoJSON} array of features to be drawn on screen
     * @map {object} the MapBox map object
     */
    drawMarker({ infoLayerData, selectedFeatures, map, MAPBOX_API }) {
        infoLayer.removeMarker({ map, id: infoLayerData.id });

        const startLocation = `${infoLayerData.longitude},${infoLayerData.latitude}`;

        const centerPoint = () => {
            const el = document.createElement('div');
            el.className = 'center';
            el.style.backgroundImage = `url(${infoLayerData.infoIconPath}center.png)`;
            el.style.backgroundSize = '100%';

            new mapboxgl.Marker(el).setLngLat(startLocation.split(',')).addTo(map);
        };

        selectedFeatures.forEach((feature) => {
            const el = document.createElement('div');
            el.className = `marker marker-${infoLayerData.id}`;
            el.style.backgroundImage = `url(${feature.icon})`;
            el.style.backgroundSize = '100%';

            el.addEventListener('click', (event) => {
                const properties = feature.properties;

                map.MapCCV.appState = {
                    type: 'user',
                    value: 'click',
                    message: `clicked on ${properties.artiste} 
                    (distance: ${Math.floor(properties.tilequery.distance)}m)`,
                    data: properties,
                };

                const endLocation = feature.geometry.coordinates;

                infoLayer.drawPath({ map, startLocation, endLocation, MAPBOX_API });
            });

            new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
        });

        centerPoint();
    },

    /*
    * remove all icons / markers
    */
    removeMarker({ map, id }) {
        const markers = document.querySelectorAll(`div.marker-${id}`);
        const center = document.querySelector('div.center');

        if (markers.length > 0) markers.forEach((d) => d.remove());
        if (center) center.remove();

        if (map.getLayer('route')) map.setLayoutProperty('route', 'visibility', 'none');
    },

    /**
     * draw features on screen
     * @selectedFeatures {geoJSON} array of features to be drawn on screen
     */
    async drawPath({ startLocation, endLocation, map, MAPBOX_API }) {
        const baseURL = 'https://api.mapbox.com/directions/v5/mapbox/walking/';
        const pathQuery = `${baseURL}${startLocation};${endLocation}?geometries=geojson&access_token=${MAPBOX_API}`;
        const pathInfo = await d3.json(pathQuery);

        const data = pathInfo.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route,
            },
        };

        // Reset route if already existing
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else {
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: geojson,
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#1c86a7',
                    'line-width': 5,
                    'line-opacity': 0.75,
                },
            });
        }

        map.setLayoutProperty('route', 'visibility', 'visible');
    },

    async getData({ infoLayerData, MAPBOX_API }) {
        const layers = infoLayerData.visibleLayers.map((d) => d.layer).join();
        const infoQuery = `https://api.mapbox.com/v4/${infoLayerData.tileset}/tilequery/
        ${infoLayerData.longitude},${infoLayerData.latitude}.json?radius=${infoLayerData.radius}&limit=
        ${d3.min([infoLayerData.maxItems, 50])}&layers=${layers}&access_token=${MAPBOX_API}`;

        const loadData = async () => {
            const infoFeatures = await d3.json(infoQuery);
            // infoFeatures.features.forEach((d, i) => console.log(i, d.properties));
            return infoFeatures;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },
};
