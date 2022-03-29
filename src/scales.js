import * as d3 from 'd3';
import { slice } from 'lodash';

export const Scales = {
    manualColors: ['#D4FBF1', '#A1F1DE', '#B1F1A1', '#EEA538', '#C01B1B'],

    pitchScale: d3.scaleLinear()
        .domain([10, 15]) // zoom
        .range([0, 45]) // pitch
        .clamp(true),

    // quantileScale: ({ data, slices }) => {
    //     const colorScale = Scales.sequentialScale(slices);
    //     const sliceArray = Array.from(Array(slices).keys());
    //     const colorArray = sliceArray.map((d, i) => colorScale(i));
    //     return d3.scaleQuantile()
    //         .domain(data)
    //         .range(colorArray);
    // },

    sequentialScale: ({ sliceNumber, name }) => d3.scaleSequential([0, sliceNumber - 1], d3[name]),

    colorArray: ({ name, sliceNumber }) => {
        const colorScale = Scales.sequentialScale({ sliceNumber, name });
        const sliceArray = Array.from(Array(sliceNumber).keys());
        return sliceArray.map((d, i) => colorScale(i));
    },

    quantileSlices: ({ data, layerProps, sliceNumber }) => {
        /* Quantile Color String  */
        const scaleData = data.map((d) => d.properties[layerProps.accessor.metric]).filter((d) => d !== 0);
        // const quantileScale = Scales.quantileScale({ data: scaleData, slices: 5 });

        const sliceArray = Array.from(Array(sliceNumber).keys());
        const quantileScale = d3.scaleQuantile()
            .domain(scaleData)
            .range(sliceArray);

        const slices = quantileScale.quantiles().map((d) => Math.round(d));
        slices.unshift(0);

        return slices;
    },

};
