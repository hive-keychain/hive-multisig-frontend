//webpack.config.js
const webpack = require('webpack');
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.js",
  },
  devServer: {
    port: 8080,
    historyApiFallback: true,
    historyApiFallback: {
      disableDotRule: true
    }
  },
  
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: { 
      url: require.resolve("url"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
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
        loader: "babel-loader",
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
  ],
};
