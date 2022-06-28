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
                { from: './assets/icons', to: 'assets/icons' },
            ],
        }),
    ],
};

module.exports = merge(commonConfig, {
    ...config,
});
