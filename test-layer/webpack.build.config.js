const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const commonConfig = require('./webpack.config');

const config = {
    mode: 'production',
    optimization: {
        minimize: true,
    },
    // plugins: [
    //     new CopyPlugin({
    //         patterns: [
    //             { from: 'src/settings', to: '' },
    //             { from: 'src/assets/icons', to: 'icons' },
    //         ],
    //     }),
    // ],
};

module.exports = merge(commonConfig, {
    ...config,
});
