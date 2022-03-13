import * as d3 from 'd3';

export const Buttons = {
    addListeners(map) {
        const buttons = document.querySelectorAll('.btn.active');
        buttons.forEach((element) => {
            const action = element.dataset.trigger;
            element.addEventListener('click', () => ButtonClick.trigger(map, action));
            console.log(element);
        });
    },
};

const ButtonClick = {
    trigger: async (map, action) => {
        switch (action) {
        case 'export-qc':
            ButtonClick.exportGeoJSON('PRNAME', 'Quebec');
            break;

        case 'export-mtl':
            ButtonClick.exportGeoJSON('CFSAUID', 'H');
            break;

        default:
            break;
        }
    },

    exportGeoJSON: async (property, searchTerm) => {
        // load full file
        const response = await d3.json('./assets/3Digit.geojson');
        console.log(response.type);

        // filter

        // save
    },
};
