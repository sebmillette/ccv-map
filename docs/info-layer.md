## Info Layer

With the info layer it is possible to visualize places from the MapBox Tile Query API.

Each Tile Query set can contain multiple layers. Each call to the Tile Query API returns a maximum of 50 places.

If a call to the API includes more than one layer, the 50 closest places of all layers will be returned.

The info layer allows furthermore to filter the returned places by a key of the properties returned by the API. Again, filtering is applied after the API was called and it is possible that the info layer will only draw a few of no markers to the map, if places that were omitted by the filter are closer to the center.

To avoid a guessing game, the info layer must be called with an unique identifier, which allows to draw multiple groups of markers in parallel to the same map.

### Required assets
Following assets are required for the info layer. 
* Icons (see `test-layer/assets/icons/`)
* CSS instructions for marker (see `test-layer/src/css/marker.scss`)

Icons and css instructions can be adapted to individual needs, like changing icon size or position.

### Calling the info layer

To draw the marker into the map, the method `map.infoLayer.create` must be called with three parameters:

* `MAPBOX_API` > MapBox API
* `map` > MapBox Object (which corresponds to `map.mapObject`)
* `infoLayerData` > Configuration Object

#### Info Layer Data
The `infoLayerData` object contains all information required to fetch the data and draw it to the map:
* `id` > The unique identifier of the marker group (allows to draw multiple icon sets at the same time)
* `infoIconPath` > Path to the icons
* `tileset` > id of the tile set to be called
* `maxItems` > The number of items to be fetched from the API (max 50)
* `radius` > The radius in meter to include places
* `visibleLayers` > Configuration of the layers to fetched from the API
* `latitude` (optional > if no latitude data is supplied, the center of the map is used)
* `longitude` (optional > if no latitude data is supplied, the center of the map is used)

#### Visible Layer Configuration
To allow a maximum of flexibility, it is possible to get data from a specific layers, multiple layers or only specific data from specific layers.

**Example: Single Layer**
The following configuration will get all data points from a layer with the id `murales-4d22r0`
The corresponding icon name must be `murales-4d22r0.png` and be placed in the folder specified by `infoIconPath`.
```JS
visibleLayers: [
    { layer: 'murales-4d22r0' },
],
```

**Example: Selected Icons from a  Single Layer**
The following configuration will get all data points from a layer with the id `murales-4d22r0` whereby the key `annee` of the feature properties match `2021`, `2020` or `2019`.

The corresponding icon name must be `m21.png` , `m20.png`, `m19.png`and be placed in the folder specified by `infoIconPath`.

All features that do not match this condition will be omitted. Because the maximum amount of items to be fetched is 50, and the filter is applied AFTER the data is fetched from the API, the number of items returned can vary.
```JS
visibleLayers: [
    { layer: 'murales-4d22r0',
        selectionKey: 'annee',
        icons:
        {
            2021: 'm21.png',
            2020: 'm20.png',
            2019: 'm19.png',
        } },

],
```

`visibleLayers` is an array. Multiple configurations can be combined in a single call.

Complete Example: 
```JS   
    const infoLayerData = {
        id: 'mySet',
        infoIconPath: '/assets/icons/',
        tileset: 'spandl.9s7tnsby',
        maxItems: 50,
        radius: 2000,
        visibleLayers: [
            { layer: 'murales-4d22r0' },
        ],
        latitude: null,
        longitude: null,
    };

    infoLayer.create.call(this, {
        MAPBOX_API: **MAPBOX_API**,
        map: map.mapObject,
        infoLayerData,
    });
```



### Removing the info layer
To remove a layer call `removeMarker` with the id and map object:

```JS
map.infoLayer.removeMarker({
    map: map.mapObject,
     id: 'mySet',
});
```

For a full working example see:
https://github.com/spandl/ccv-map/blob/main/test-layer/src/gui.js#L112


## Geo JSON Layer
In addition to the geo-located info layer, the library can draw geoJSON data with Points or LineStrings.

### Draw Geo JSON layer
call `infoLayer.drawGeoJSON` with following parameters:
* `Map` > the map object
* `geoJSON` > GeoJSON data
* `infoLayerData` > information about the layer

### Info Layer Data
* `id`: (REQUIRED) id of the layer (allows to create multiple layers)
* `minzoom`: minimum zoom before the layer is shown
* `maxzoom`: maximum zoom after the layer is hidden
* `lineWidth`: Default line width if not specified in the geoJSON
* `lineColor`: Default line color if not specified in the geoJSON
* `circleRadius`:  Default circle radius if not specified in the geoJSON
* `circleColor`: Default circle color if not specified in the geoJSON
* `strokeColor`: Default stroke color if not specified in the geoJSON
* `strokeWidth`:  Default stroke width if not specified in the geoJSON
* `opacity`:  Default circle opacity if not specified in the geoJSON


```JS
const metroData = await d3.json('data/metromap.json');
map.infoLayer.drawGeoJSON({
    map: map.mapObject,
    geoJSON: metroData,
    infoLayerData: {
        id: 'metro',
        minzoom: 13,
        maxzoom: 22,
        lineWidth: 2,
        lineColor: 'pink',
        circleRadius: 6,
        circleColor: 'white',
        strokeColor: 'black',
        strokeWidth: 2,
        opacity: 1,

    },
});
```

### Geo JSON Data
The `properties` section of the geoJSON can contain data that will adapt the style of each feature individually.
Following properties are rendered

#### LineString
* `lineWidth` (integer)
* `lineColor` (color in any format)

#### Point
* `circleRadius`: (integer)
* `circleColor`: (color in any format)
* `strokeColor`: (color in any format)
* `strokeWidth`: (integer)
* `opacity`: (integer, 0-1)


## Remove Geo JSON layer
To remove a geo JSON layer completely (not just restricting display by zoom level)

* `map` > the map object
* `id`: > id of the layer

```JS
map.infoLayer.removeGeoJSON({
    map: map.mapObject,
    id: 'metro',
});
```