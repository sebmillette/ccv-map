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

        /*
        ! VERSION WITH VECTOR TILESETS
        map.addSource('tileset', {
            type: 'vector',
            url: 'mapbox://spandl.dl1htdno',
        });

        map.addLayer({
            id: 'tileset',
            type: 'line',
            source: 'tileset',
            'source-layer': 'sold_basickpi_level_01_high_c-aav230',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': '#ff69b4',
                'line-width': 1,
            },
        });

         map.on('click', (e) => {
            // Set `bbox` as 5px reactangle area around clicked point.
            const bbox = [
                [e.point.x - 50000, e.point.y - 50000],
                [e.point.x + 50000, e.point.y + 50000],
            ];
            // Find features intersecting the bounding box.
            const selectedFeatures = map.queryRenderedFeatures(bbox, {
                layers: ['tileset'],
            });
            const fips = selectedFeatures.map(
                (feature) => feature.properties.CCSUID,
            );
            // Set a filter matching selected features by FIPS codes
            // to activate the 'counties-highlighted' layer.
            // map.setFilter('counties-highlighted', ['in', 'FIPS', ...fips]);
            const all = map.queryRenderedFeatures({ layers: ['tileset'] });
            console.log(all);
        });

        const test0 = map.getSource('tileset');
        const test = map.getSource('tileset').vectorLayerIds;
        const features = map.querySourceFeatures('tileset', {
            sourceLayer: 'sold_basickpi_level_01_high_c-aav230',
        });

        // Find all features within a static bounding box
        const query = map.queryRenderedFeatures(
            [[10, 20], [300, 500]],
            { layers: ['tileset'] },
        );

        const stateDataLayer = map.getLayer('tileset');
        const a = 2; */

        /*
        ! TO DO CONNECT TO COLOR FUNCTION
        */
        const sliceNumber = payload.layerProperties.segmentAmount;
        const dotLayer = payload.data.showAsLayer ? 'locations' : '';
        const slices = Scales.quantileSlices({ data: data.features, layerProps, sliceNumber });

        // const colorArray = Scales.colorArray({ name: 'interpolateYlOrRd', sliceNumber });

        const customColors = payload.layerProperties.segmentColors;
        const customColorScale = Scales.customColorScale({ customColors, sliceNumber });

        map.MapCCV.appState = { type: 'info', value: 'quantiles', message: `${layerProps.name}: ${slices}` };

        // Dynamic generation of fill-color
        const fillColorSteps = [
            'step',
            ['get', layerProps.metricAccessor],
            customColorScale(0),
        ];
        slices.forEach((d, index) => {
            if (index > 0) {
                fillColorSteps.push(slices[index]);
                fillColorSteps.push(customColorScale(index));
            }
        });
        // Dynamic generation of fill-color

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
                    1,
                ],

            },
        },
        dotLayer); // place choropleth UNDERNEATH dot layer, if available

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
                'line-color': [
                    'case',
                    ['<', ['get', layerProps.metricAccessor], 1], '#FFF',
                    ['boolean', ['feature-state', 'click'], false], '#758f94',
                    ['boolean', ['feature-state', 'hover'], false], '#758f94',
                    '#FFF',
                ],

                'line-opacity':
                [
                    'case',
                    ['<', ['get', layerProps.metricAccessor], 1], 0,
                    ['boolean', ['feature-state', 'click'], false], 1,
                    ['boolean', ['feature-state', 'hover'], false], 0.75,
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

            const value = feature.properties[layerProps.metricAccessor];
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
                .setHTML(`<strong>${layerProps.metricAccessor}:</strong> ${print}`)
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
