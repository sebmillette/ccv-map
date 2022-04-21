const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config');

const config = {
    mode: 'production',
    optimization: {
        minimize: true,
    },

};

module.exports = merge(commonConfig, {
    ...config,
});
