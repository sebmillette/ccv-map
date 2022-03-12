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
            ],
        }),
    ],
};

module.exports = merge(commonConfig, {
    ...config,
});
