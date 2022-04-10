import { Scales } from './scales';

export const Colors = {
    layerPaintSteps: ({ payload, layer }) => {
        const layerName = layer.name;
        const layerProps = layer;

        const data = payload.layerData.find((d) => d[layerName])[layerName].features;

        const sliceNumber = payload.layerProperties.segmentAmount;
        const slices = Scales.quantileSlices({ data, layerProps, sliceNumber });

        const customColors = payload.layerProperties.segmentColors;
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
