const path = require("path");
const pkg = require("./package.json");

module.exports = {
  entry: "./src/index.ts",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "large-graph-renderer.js",
  },

  mode: "production",
  devtool: "source-map",

  resolve: {
    // Add ".ts" and ".tsx" as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },

  externals: {
    react: "React",
    "deck.gl": "deck",
    "@deck.gl/aggregation-layers": "deck",
    "@deck.gl/core": "deck",
    "@deck.gl/react": "deck",
    "@deck.gl/extensions": "deck",
    "@deck.gl/layers": "deck",
    "@loaders.gl/core": "loaders",
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
};
