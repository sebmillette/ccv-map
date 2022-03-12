import * as d3 from 'd3';

export const Data = {
    load({ path }) {
        const loadData = async () => {
            const response = await d3.json(path);
            return response;
        };

        return new Promise((resolve) => {
            resolve(loadData());
        });
    },

};
