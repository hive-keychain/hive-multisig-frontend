//webpack.config.js
const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js',
  },
  devServer: {
    port: 8080,
    historyApiFallback: true,
    historyApiFallback: {
      disableDotRule: true,
    },
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      url: require.resolve('url'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      os: false,
      path: false,
      // "stream": false,
      // "buffer": false
      // "buffer": require.resolve("buffer")
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: [],
        use: {
          loader: 'ts-loader',
          options: {
            allowTsInNodeModules: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
    new NodePolyfillPlugin(),
  ],
};
