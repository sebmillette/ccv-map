import * as d3 from 'd3';

export const infoLayer = {

    /**
     * fetch data from Tile query API and draw icons on map
     * @infoLayerData {object} contains detailed info about features to draw
     * @MAPBOX_API {string} API key
     */
    async create({ infoLayerData, MAPBOX_API, map }) {
        const infoFeatures = await infoLayer.getData({ infoLayerData, MAPBOX_API });
        infoLayer.update.call(this, { infoLayerData, infoFeatures, map });
    },

    /**
     * filter features by sub category
     * @infoLayerData {object} contains detailed info about features to draw
     * @infoFeatures {geoJSON} all features returned from API
     */
    update({ infoLayerData, infoFeatures, map }) {
        console.log({ infoLayerData, infoFeatures });
        const { visibleLayers } = infoLayerData;

        // Filter sub-categories
        const filterFeatures = (layer) => {
            const key = layer.selectionKey;
            const groups = layer.selection.map((selection) => selection.group);
            return infoFeatures.features.filter((d) => groups.includes(d.properties[key]));
        };

        // Filter only if sub categories are defined + combine features
        const selectedFeatures = visibleLayers.map((layer) => {
            const selection = layer.selection;
            const features = selection && selection.length > 0
                ? filterFeatures(layer)
                : infoFeatures.features;
            return features;
        }).flat();

        infoLayer.draw.call(this, { selectedFeatures, map });
    },

    /**
     * draw features on screen
     * @selectedFeatures {geoJSON} array of features to be drawn on screen
     */
    draw({ selectedFeatures, map }) {
        console.log('selectedFeatures', selectedFeatures);

        map.addSource('tilequery', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: selectedFeatures,
            },
        });

        map.addLayer({
            id: 'tilequery-points',
            type: 'circle',
            source: 'tilequery',
            paint: {
                'circle-stroke-color': 'white',
                'circle-stroke-width': {
                // Set the stroke width of each circle: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-stroke-width
                    stops: [
                        [0, 0.1],
                        [18, 3],
                    ],
                    base: 5,
                },
                'circle-radius': {
                // Set the radius of each circle, as well as its size at each zoom level: https://docs.mapbox.com/mapbox-gl-js/style-spec/#paint-circle-circle-radius
                    stops: [
                        [12, 7],
                        [22, 180],
                    ],
                    base: 8,
                },
                'circle-color': '#eb8517',
            },
        });

        map.on('click', 'tilequery-points', (event) => {
            const properties = event.features[0].properties;
            // console.log(properties);

            map.MapCCV.appState = {
                type: 'user',
                value: 'click',
                message: `clicked on ${properties.name}`,
                data: properties,
            };
        });

        map.on('mouseenter', 'tilequery-points', (event) => {
            map.getCanvas().style.cursor = 'pointer'; // When the cursor enters a feature, set it to a pointer
        });

        map.on('mouseleave', 'tilequery-points', () => {
            map.getCanvas().style.cursor = '';
        });
    },

    async getData({ infoLayerData, MAPBOX_API }) {
        const layers = infoLayerData.visibleLayers.map((d) => d.layer).join();
        const infoQuery = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/
        ${infoLayerData.latitude},${infoLayerData.longitude}.json?radius=${infoLayerData.radius}&limit=
        ${infoLayerData.maxItems}&layers=${layers}&access_token=${MAPBOX_API}`;

        const loadData = async () => {
            const infoFeatures = await d3.json(infoQuery);
            return infoFeatures;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },
};
