import * as dat from 'dat.gui';

export const GUI = {
    create({ payload, map }) {
        const gui = new dat.GUI();

        const mapSection = gui.addFolder('Map');
        mapSection.open();

        mapSection
            .add(payload.map, 'style', { Light: 'light-v10', Dark: 'dark-v10' })
            .onChange((value) => {
                map.update({ property: 'style', value });
            });
    },
};
