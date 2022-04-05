const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    RangeSlider: './Wrapper.ts',
    demo: './demo/demo.ts'
  },
  output: {
    filename: '[name]/[name].js',
    path: path.resolve(__dirname + '/docs'),
    assetModuleFilename: 'assets/[name][ext]'
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 4200,
    hot: isDev
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new HTMLWebpackPlugin({
      filename: 'demo/demo.html',
      template: './demo/demo.pug',
      scriptLoading: 'blocking',
      chunks: ['RangeSlider', 'demo']
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]/[name].css'
    }),
    new ESLintPlugin({
      extensions: ['.tsx', '.ts', '.js'],
    })
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: isDev
        },
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader', 'resolve-url-loader', 'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|svg|ttf|woff)$/,
        type: 'asset/resource'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ] 
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};