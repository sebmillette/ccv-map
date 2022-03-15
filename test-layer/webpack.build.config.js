const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const commonConfig = require('./webpack.config');

const config = {
    mode: 'production',
    optimization: {
        minimize: true,
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './src/data', to: 'data' },
                { from: '../src/layer-data', to: 'layer-data' },
            ],
        }),
    ],
};

module.exports = merge(commonConfig, {
    ...config,
});
