import * as dat from 'dat.gui';

export const GUI = {
    create({ payload, map }) {
        const gui = new dat.GUI();
        gui.close();
        gui.width = 250;

        const mapSection = gui.addFolder('Map');
        mapSection.open();

        mapSection
            .add(payload.map, 'style', { Light: 'light-v10', Dark: 'dark-v10' })
            .onChange((value) => {
                map.update({ property: 'style', value });
            });
        mapSection
            .add(payload.map, 'geoCenterType', {
                'Data Center': 'dataCenter', Manual: 'manual', 'Data Bound': 'dataBound',
            });
        mapSection
            .add(payload.map, 'geoCenterValue');
        mapSection
            .add(payload.map, 'zoom');

        // Fly-to button
        const flyBtn = { 'fly to destination': () => {
            map.update({ property: 'location', value: payload.map });
        } };
        mapSection.add(flyBtn, 'fly to destination');

        const dataSection = gui.addFolder('Data');
        dataSection
            .add(payload.data, 'locationPath');

        const dataBtn = { 'replace data': () => { console.log('replace data'); } };
        dataSection.add(dataBtn, 'replace data');
    },
};
