import { Scales } from './scales';

export const Colors = {
    layerPaintSteps: ({ layerData, layerProperties, layer }) => {
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
            customColorScale(0),
        ];
        slices.forEach((d, index) => {
            if (index > 0) {
                fillColorSteps.push(slices[index]);
                fillColorSteps.push(customColorScale(index));
            }
        });

        return fillColorSteps;
    },
};
