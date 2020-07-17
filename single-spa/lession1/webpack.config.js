// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    // Set the single-spa config as the project entry point
    'single-spa.config': 'single-spa.config.js',
  },
  output: {
    publicPath: '/dist/',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        // Webpack style loader added so we can use materialize
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
      },
      {
        // This plugin will allow us to use html templates when we get to the angularJS app
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader',
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
  },
  plugins: [
    // A webpack plugin to remove/clean the build folder(s) before building
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist'],
    }),
  ],
  devtool: 'source-map',
  externals: [],
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://11.161.206.179/',
        // target: 'http://100.81.116.60/',
        // target: 'https://daily.occ.aliyun-inc.test',
        changeOrigin: true,
        pathRewrite: { '^/api': '/api' },
      },
    },
  },
};
