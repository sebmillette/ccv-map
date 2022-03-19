## Payload

```
const payload = {
    MAPBOX_API: config.MAPBOX_API,
    id: containerId,
    map: {
        style: 'dark-v10',
        zoom: 12,
        geoCenterType: 'data', // [manual, postalCode]
        geoCenterValue: '-73.595, 45.488',
    },
    data: {
        locationPath: 'data/locations.geojson', // GeoJSON with properties
        zipData: 'data/3Digit_MTL.geojson', // GeoJSON without metrics
        accessors: {
            metric: 'Superficie',
        },
    },
    eventCallback: mapEvents,
};
```

|property|description|values|
|---|---|---|
| MAPBOX_API  | mapbox API code  |   |
|map.style|style of map|   |
|map.zoom|initial zoom of map   |   |
|map.geoCenterType|How to position the map|[manual, data, postalCode]|
|map.geoCenterValue|Used if type is manual|Array of longitude and latitude: '-73.595, 45.488'|
|data.locationPath|Path to the location data|Must be a geoJSON file|
|data.zipData|Path to the postal code layer data|Must be a geoJSON file|
|data.accessors|List of accessors|Will change >> organized by layer|


## App Status
The application is updating an object called `appState`.

The object can be watched using a hook or by supplying a callback function which will be called every time the object is changing.

Example
`payload.callback: mapEvents` will call the function mapEvents for each update

Currently `appState` is an object with three properties, but this will be adapted depending on the application needs:

Example:
```
{ type: 'status', value: 'success', message: 'Zip layer loaded' };
```