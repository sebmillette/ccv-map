/* eslint-disable max-len */
import mapboxgl from 'mapbox-gl';
import * as _ from 'lodash';
import * as d3 from 'd3';

import { Scales } from '../scales';
import { Tools } from '../tools';

export const ZipLayer = {

    fillOpacity: 0.5,
    add: ({ map, payload, layer }) => {
        const layerName = Object.keys(layer)[0];
        const layerProps = payload.layers.find((d) => d.name === layerName);
        const data = layer[layerName];
        const interactionId = `${layerName}Fill`;
        const zoomExtent = [layerProps.minzoom, layerProps.maxzoom];

        map.addSource(layerName, {
            type: 'geojson',
            data,
        });

        map.addLayer({
            id: `${layerName}`,
            type: 'line',
            source: layerName,
            minzoom: zoomExtent[0],
            maxzoom: zoomExtent[1],
            layout: {},
            custom: true,
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
        const slices = Scales.quantileSlices({ data: data.features, layerProps });
        map.MapCCV.appState = { type: 'info', value: 'quantiles', message: `${layerProps.name}: ${slices}` };

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
                /* 'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', layerProps.accessor.metric],
                    slices[0],
                    '#c1f7f6', // quantileScale(slices[0]),
                    slices[1],
                    '#9ae1b2', // quantileScale(slices[1]),
                    slices[2],
                    '#b2bd57', // quantileScale(slices[2]),
                    slices[3],
                    '#e0861d', // quantileScale(slices[3]),
                    slices[4],
                    '#ff144b', // quantileScale(slices[4]),
                ], */
                'fill-color': [
                    'step',
                    ['get', layerProps.accessor.metric],
                    Scales.manualColors[0],
                    slices[1],
                    Scales.manualColors[1],
                    slices[2],
                    Scales.manualColors[2],
                    slices[3],
                    Scales.manualColors[3],
                    slices[4],
                    Scales.manualColors[4],
                ],
                // See: https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/
                'fill-opacity':
                // 0.5,
                [
                    'case',
                    ['<', ['get', layerProps.accessor.metric], 1], 0,
                    ['boolean', ['feature-state', 'click'], false], 0.85,
                    ['boolean', ['feature-state', 'hover'], false], 0.6,
                    0.5,
                ],

            },
        },
        dotLayer); // place choropleth UNDERNEATH dot layer, if available

        // Add Tooltip
        map.hoveredStateId = null;
        map.clickStateId = null;
        ToolTip.add({ map, interactionId, layerProps });
    },

    update: ({ payload }) => {

    },
};

const ToolTip = {
    add: ({ map, interactionId, layerProps }) => {
        map.on('click', interactionId, (event) => {
            // const num = d3.format('($,.2r')(event.features[0].properties.metric);
            const feature = event.features[0];

            const bounds = Tools.calculateBounds({ feature });

            // make bound available to parent
            map.MapCCV.selectedBounds = bounds;
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
                if (map.clickStateId !== null) {
                    map.setFeatureState(
                        { source: layerProps.name, id: map.clickStateId },
                        { click: false },
                    );
                }
                map.clickStateId = event.features[0].id;
                map.setFeatureState(
                    { source: layerProps.name, id: map.clickStateId },
                    { click: true },
                );
            }

            map.MapCCV.appState = { type: 'user', value: 'click', message: `clicked on ${layerProps.geoKey}: ${feature.properties[layerProps.geoKey]}` };
            /*
            ! To Do - zoom to bound (using external button)
            */
            map.tooltip = new mapboxgl.Popup()
                .setLngLat(center)
                .setHTML(`<strong>${layerProps.accessor.metric}:</strong> ${print}`)
                .addTo(map);
        });

        map.on('mousemove', interactionId, (event) => {
            // Manage hover state
            if (event.features.length > 0) {
                if (map.clickStateId === event.features[0].id) return;
                if (map.hoveredStateId !== null) {
                    map.setFeatureState(
                        { source: layerProps.name, id: map.hoveredStateId },
                        { hover: false },
                    );
                }
                map.hoveredStateId = event.features[0].id;
                map.setFeatureState(
                    { source: layerProps.name, id: map.hoveredStateId },
                    { hover: true },
                );
            }
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', interactionId, () => {
            // Manage hover state
            if (map.hoveredStateId !== null) {
                map.setFeatureState(
                    { source: layerProps.name, id: map.hoveredStateId },
                    { hover: false },
                );
            }
            map.hoveredStateId = null;
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
