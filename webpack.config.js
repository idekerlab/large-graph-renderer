const path = require("path");
const webpack = require("webpack");
const pkg = require("./package.json");

module.exports = {
  mode: "development",
  devtool: "source-map",
  context: path.join(__dirname, './src'),
  
  // Export all public API from here.
  entry: "./index.ts",
  
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "large-graph-renderer.js",
    library: "largeGraphRenderer",
    libraryTarget: "umd"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },

  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "react",
      root: "React",
    },
    "react-dom": {
      root: "ReactDOM",
      commonjs2: "react-dom",
      commonjs: "react-dom",
      amd: "react-dom",
    },
    '@deck.gl/core': {
      root: "DeckGL",
      commonjs2: "deck.gl",
      commonjs: "deck.gl",
      amd: "deck.gl",
    },
    '@deck.gl/layers': {
      root: "DeckGL",
      commonjs2: "deck.gl",
      commonjs: "deck.gl",
      amd: "deck.gl",
    },
    '@luma.gl/core': {
      root: "luma",
      commonjs2: "luma",
      commonjs: "luma",
      amd: "luma",
    }

  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "source-map-loader",
      },
    ],
  },
  plugins: [new webpack.NamedModulesPlugin()],
};
