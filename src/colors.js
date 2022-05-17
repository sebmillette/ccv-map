import * as d3 from 'd3';
import { Scales } from './scales';

export const Colors = {
    paintSteps: ({ layerData, layerProperties, layer, darken = false } = {}) => {
        const quintileFillColorSteps = Colors.quantilePaintSteps({
            layerData,
            layerProperties,
            layer,
        });

        const quantizeFillColorSteps = Colors.quantizePaintSteps({
            layerData,
            layerProperties,
            layer,
        });

        return layerProperties.scaleType === 'quantile'
            ? quintileFillColorSteps
            : quantizeFillColorSteps;
    },

    quantilePaintSteps: ({ layerData, layerProperties, layer, darken = false } = {}) => {
        const layerProps = layer;

        const sliceNumber = layerProperties.segmentAmount;
        const slices = Scales.quantileSlices({ data: layerData, layerProps, sliceNumber });

        const customColors = layerProperties.segmentColors;
        const customColorScale = Scales.quantileColorScale({ customColors, sliceNumber });

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

    quantizePaintSteps: ({ layerData, layerProperties, layer, darken = false } = {}) => {
        const layerProps = layer;

        const scaleData = layerData.map((d) => d.properties[layerProps.metricAccessor]).filter((d) => d !== 0);
        const domain = d3.extent(scaleData);
        const mean = d3.mean(domain);
        domain.splice(1, 0, mean);
        const customColors = layerProperties.segmentColors;

        const fillColorSteps = [
            'interpolate',
            ['linear'],
            ['get', layerProps.metricAccessor],
            domain[0],
            darken ? Colors.darkenLightColors(customColors[0]) : customColors[0],
            domain[1],
            darken ? Colors.darkenLightColors(customColors[1]) : customColors[1],
            domain[2],
            darken ? Colors.darkenLightColors(customColors[2]) : customColors[2],
        ];

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
