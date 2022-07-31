import * as _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import { Colors } from '../colors';
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

        const layerData = payload.layerData.find((d) => d[layerName])[layerName].features;

        const fillColorSteps = Colors.paintSteps({
            layerData,
            layerProperties: payload.layerProperties,
            layer: layerProps,
        });

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
                'fill-color': fillColorSteps,
                'fill-opacity':
                // See: https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/
                [
                    'case',
                    ['<', ['get', layerProps.metricAccessor], 1], 0,
                    0.85,
                ],

            },
        },
        'waterway-label'); // place choropleth UNDERNEATH dot layer, if available

        const lineColorSteps = Colors.paintSteps({
            layerData,
            layerProperties: payload.layerProperties,
            layer: layerProps,
            darken: true,
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
                    ['<', ['get', layerProps.metricAccessor], 1], 0,
                    ['boolean', ['feature-state', 'click'], false], 4,
                    ['boolean', ['feature-state', 'hover'], false], 3,
                    1,
                ],
                'line-color': lineColorSteps,

                'line-opacity':
                [
                    'case',
                    ['<', ['get', layerProps.metricAccessor], 1], 0,
                    ['boolean', ['feature-state', 'click'], false], 1,
                    ['boolean', ['feature-state', 'hover'], false], 0.85,
                    0.1,
                ],
            },
        });
        // Add Tooltip
        map.hoveredStateId = null;
        map.clickStateId = null;
        ToolTip.add({ map, interactionId, layerProps });
    },

    update: ({ payload }) => {

    },

    removeLayerHighlights({ map }) {
        map.MapCCV.payload.layers.forEach((layer) => {
            if (map.clickStateId !== null) {
                map.setFeatureState(
                    { source: layer.name, id: map.clickStateId },
                    { click: false },
                );
                map.setFeatureState(
                    { source: layer.name, id: map.clickStateId },
                    { hover: false },
                );
            }
        });
        map.clickStateId = null;
    },
};

const ToolTip = {
    add: ({ map, interactionId, layerProps }) => {
        map.on('click', interactionId, (event) => {
            const feature = event.features[0];
            const bounds = Tools.calculateBounds({ feature });
            // make bound available to parent
            map.MapCCV.selectedBounds = bounds;

            // Manage click state
            if (event.features.length > 0) {
                ZipLayer.removeLayerHighlights({ map }); // loops through all layers

                map.clickStateId = event.features[0].id;
                map.setFeatureState(
                    { source: layerProps.name, id: map.clickStateId },
                    { click: true },
                );
            }

            const center = Tools.centerOfBounds({ bounds });
            const featureCenter = new mapboxgl.LngLat(center[1], center[0]);
            const pointerLocation = event.lngLat.wrap();

            map.MapCCV.appState = {
                type: 'user',
                value: 'click',
                message: `clicked on ${layerProps.geoKey}: ${feature.properties[layerProps.geoKey]}`,
                data: {
                    source: layerProps.name,
                    key: [layerProps.geoKey],
                    keyValue: feature.properties[layerProps.geoKey],
                    featureCenter,
                    pointerLocation,
                },
            };

            // ONLY REQUIRED FOR DEBUGGING
            // const center = bounds.getCenter();
            // const value = feature.properties[layerProps.metricAccessor];
            // const valueFormat = `${d3.format('(,.2r')(value)}`;
            // const print = value === 0 ? 'no value' : valueFormat;

            // map.tooltip = new mapboxgl.Popup()
            //     .setLngLat(center)
            //     .setHTML(`<strong>${layerProps.metricAccessor}:</strong> ${print}`)
            //     .addTo(map);
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
