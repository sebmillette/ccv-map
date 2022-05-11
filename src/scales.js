import * as d3 from 'd3';

export const Scales = {
    manualColors: ['#D4FBF1', '#A1F1DE', '#B1F1A1', '#EEA538', '#C01B1B'],

    pitchScale: d3.scaleLinear()
        .domain([10, 15]) // zoom
        .range([0, 45]) // pitch
        .clamp(true),

    sequentialScale: ({ sliceNumber, name }) => d3.scaleSequential([0, sliceNumber - 1], d3[name]),

    colorArray: ({ name, sliceNumber }) => {
        const colorScale = Scales.sequentialScale({ sliceNumber, name });
        const sliceArray = Array.from(Array(sliceNumber).keys());
        return sliceArray.map((d, i) => colorScale(i));
    },

    quantileColorScale: ({ customColors, sliceNumber }) => {
        const domain = customColors.map((d, index) => (sliceNumber - 1) * (index / (customColors.length - 1)));
        return d3.scaleLinear()
            .domain(domain)
            .range(customColors)
            .interpolate(d3.interpolateRgb);
    },

    quantizeColorScale: ({ customColors, data, layerProps }) => {
        const scaleData = data.map((d) => d.properties[layerProps.metricAccessor]).filter((d) => d !== 0);
        const domain = d3.extent(scaleData);
        const colorRange = ['white', 'red'];
        return d3.scaleLinear()
            .domain(domain)
            .range(colorRange);
    },

    quantileSlices: ({ data, layerProps, sliceNumber }) => {
        const scaleData = data.map((d) => d.properties[layerProps.metricAccessor]).filter((d) => d !== 0);

        const range = Array.from(Array(sliceNumber).keys());
        const quantileScale = Scales.quantileScale({ data: scaleData, range });

        const slices = quantileScale.quantiles().map((d) => Math.round(d));
        slices.unshift(0);

        return slices;
    },

    quantileScale: ({ data, range }) => d3.scaleQuantile()
        .domain(data)
        .range(range),

};
