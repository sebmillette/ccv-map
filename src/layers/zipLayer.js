/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { Data } from '../data';

export const ZipLayer = {

    fillOpacity: 0.5,
    add: ({ map, payload, layer }) => {
        const layerName = Object.keys(layer)[0];
        const layerProps = payload.layers.find((d) => d.name === layerName);
        const data = layer[layerName];
        const interactionId = `${layerName}Fill`;
        const zoomExtent = layerProps.zoomVisibility;

        // data properties
        const metricExtent = d3.extent(data.features, (d) => Number(d.properties[layerProps.accessor.metric]));

        map.addSource(layerName, {
            type: 'geojson',
            data,
        });

        /*
        ! TO DO : color scheme
        */

        map.addLayer({
            id: `${layerName}Line`,
            type: 'line',
            source: layerName,
            minzoom: zoomExtent[0],
            maxzoom: zoomExtent[1],
            layout: {},
            paint: {
                'line-width':
                [
                    'case',
                    ['boolean', ['feature-state', 'click'], false], 3,
                    ['boolean', ['feature-state', 'hover'], false], 2,
                    1,
                ],
                'line-color': '#FFF',
                'line-opacity': 0.4,
            },
        });

        const dotLayer = payload.data.showAsLayer ? 'locations' : '';
        const zoomOverlay = 0.5;
        map.addLayer({
            id: interactionId,
            type: 'fill',
            source: layerName,
            minzoom: zoomExtent[0],
            maxzoom: zoomExtent[1],
            layout: {
                visibility: 'visible', // for manual enable disable
            },
            paint: {
                // 'fill-fill-sort-key': 20,
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', layerProps.accessor.metric],
                    0,
                    '#FFF',
                    50,
                    '#EED322',
                    100,
                    '#E6B71E',
                    200,
                    '#DA9C20',
                ],
                // See: https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/
                'fill-opacity':
                // 0.5,
                [
                    'case',
                    ['boolean', ['feature-state', 'click'], false], 0.85,
                    ['boolean', ['feature-state', 'hover'], false], 0.5,
                    0.2,
                ],

            },
        },
        dotLayer); // place choropleth UNDERNEATH dot layer, if available

        // Add Tooltip
        ToolTip.add({ map, interactionId, layerProps });
    },
};

let hoveredStateId = null;
let clickStateId = null;

const ToolTip = {
    add: ({ map, interactionId, layerProps }) => {
        map.on('click', interactionId, (event) => {
            // const num = d3.format('($,.2r')(event.features[0].properties.metric);
            const feature = event.features[0];
            const coordinates = feature.geometry.coordinates;

            const type = feature.geometry.type;
            const coordinateArray = type === 'Polygon'
                ? _.flatten(coordinates)
                : _.flatten(_.flatten(coordinates));

            // Create a 'LngLatBounds' with both corners at the first coordinate.
            const bounds = new mapboxgl.LngLatBounds(
                coordinateArray[0],
                coordinateArray[0],
            );

            coordinateArray.forEach((d) => bounds.extend(d));
            const center = bounds.getCenter();

            /*
            ! Final formatting
            ! Add prefix or unit to layerProps
            */

            const value = feature.properties[layerProps.accessor.metric];
            const valueFormat = `${d3.format('(,.2r')(value)}${layerProps.accessor.unit}`;
            const print = value === 0 ? 'no value' : valueFormat;

            // drawBox({ map, bounds });

            // Manage click state
            if (event.features.length > 0) {
                if (clickStateId !== null) {
                    map.setFeatureState(
                        { source: layerProps.name, id: clickStateId },
                        { click: false },
                    );
                }
                clickStateId = event.features[0].id;
                map.setFeatureState(
                    { source: layerProps.name, id: clickStateId },
                    { click: true },
                );
            }

            map.MapCCV.appState = { type: 'user', value: 'click', message: `clicked on ${layerProps.geoKey}: ${feature.properties[layerProps.geoKey]}` };
            /*
            ! To Do - zoom to bound (using external button)
            */
            new mapboxgl.Popup()
                .setLngLat(center)
                .setHTML(`<strong>${layerProps.accessor.metric}:</strong> ${print}`)
                .addTo(map);
        });

        map.on('mousemove', interactionId, (event) => {
            // Manage hover state
            if (event.features.length > 0) {
                if (clickStateId === event.features[0].id) return;
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: layerProps.name, id: hoveredStateId },
                        { hover: false },
                    );
                }
                hoveredStateId = event.features[0].id;
                map.setFeatureState(
                    { source: layerProps.name, id: hoveredStateId },
                    { hover: true },
                );
            }
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', interactionId, () => {
            // Manage hover state
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: layerProps.name, id: hoveredStateId },
                    { hover: false },
                );
            }
            hoveredStateId = null;
            map.getCanvas().style.cursor = 'default';
        });
    },
};

const drawBox = ({ map, bounds }) => {
    const northEast = [bounds._ne.lng, bounds._ne.lat];
    const southEast = [bounds._ne.lng, bounds._sw.lat];
    const southWest = [bounds._sw.lng, bounds._sw.lat];
    const northWest = [bounds._sw.lng, bounds._ne.lat];

    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: [
                    northEast, southEast, southWest, northWest, northEast,
                ],
            },
        },
    });
    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#ff0000',
            'line-width': 5,
        },
    });
};
