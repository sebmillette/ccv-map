import * as dat from 'dat.gui';

export const GUI = {
    create({ payload, map }) {
        const gui = new dat.GUI();
        gui.width = 300;

        const mapSection = gui.addFolder('Map');
        mapSection.open();

        mapSection
            .add(payload.map, 'style', { Light: 'light-v10', Dark: 'dark-v10' })
            .onChange((value) => {
                map.update({ property: 'style', value });
            });

        mapSection
            .add(payload.map, 'geoCenterType', { Data: 'data', Manual: 'manual', 'Postal Code': 'postalCode' });
        mapSection
            .add(payload.map, 'geoCenterValue');
        mapSection
            .add(payload.map, 'zoom');

        // Fly-to button
        const obj = { 'fly to destination': () => { console.log('fly to destination'); } };
        mapSection.add(obj, 'fly to destination');
    },
};
