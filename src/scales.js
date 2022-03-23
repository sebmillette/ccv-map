import * as d3 from 'd3';

export const Scales = {

    pitchScale: d3.scaleLinear()
        .domain([10, 15]) // zoom
        .range([0, 45]) // pitch
        .clamp(true),

    sequentialScale: (slices) => d3.scaleSequential([0, slices - 1], d3.interpolateBlues),

    quantileScale: ({ data, slices }) => {
        const colorScale = Scales.sequentialScale(slices);
        const sliceArray = Array.from(Array(slices).keys());
        const colorArray = sliceArray.map((d, i) => colorScale(i));
        return d3.scaleQuantile()
            .domain(data)
            .range(colorArray);
    },

};
