import * as d3 from 'd3';

export const Scales = {

    pitchScale: d3.scaleLinear()
        .domain([10, 15]) // zoom
        .range([0, 45]) // pitch
        .clamp(true),

};
