const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const commonConfig = require('./webpack.config');

const entryKey = Object.keys(commonConfig.entry)[0];

const config = {
    mode: 'development',
    // devtool: 'eval',
    // devtool: 'cheap-source-map',
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, './src'),
        },
        compress: true,
        port: 8080,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'views/index.ejs',
            filename: 'index.html',
            inject: true,
            title: commonConfig.name,
            templateParameters: {
                js: `${entryKey}.js`,
                css: `${entryKey}.css`,
            },
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: './data', to: 'data' },
            ],
        }),
        new webpack.DefinePlugin({
            'process.env.MAPBOX_API': JSON.stringify('MAPBOX_API'),
        }),
    ],
};

module.exports = merge(commonConfig, {
    ...config,
});
