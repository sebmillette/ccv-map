import * as d3 from 'd3';
import { Scales } from './scales';

export const Colors = {
    layerPaintSteps: ({ layerData, layerProperties, layer, darken = false } = {}) => {
        const layerName = layer.name;
        const layerProps = layer;

        // const data = layerData.find((d) => d[layerName])[layerName].features;

        const sliceNumber = layerProperties.segmentAmount;
        const slices = Scales.quantileSlices({ data: layerData, layerProps, sliceNumber });

        const customColors = layerProperties.segmentColors;
        const customColorScale = Scales.customColorScale({ customColors, sliceNumber });

        const fillColorSteps = [
            'step',
            ['get', layerProps.metricAccessor],
            darken ? Colors.darkenLightColors(customColorScale(0)) : customColorScale(0),
        ];

        slices.forEach((d, index) => {
            if (index > 0) {
                fillColorSteps.push(slices[index]);
                const color = darken ? Colors.darkenLightColors(customColorScale(index)) : customColorScale(index);
                fillColorSteps.push(color);
            }
        });

        return fillColorSteps;
    },

    brightness: (rgb) => Math.round(
        // eslint-disable-next-line radix
        (parseInt(rgb.r) * 299 + parseInt(rgb.g) * 587 + parseInt(rgb.b) * 114) / 1000,
    ),

    darkenLightColors: (color) => {
        const rgb = d3.color(color);
        const factor = Colors.brightness(rgb) / 300;
        return rgb.darker(factor).formatRgb();
    },

};
