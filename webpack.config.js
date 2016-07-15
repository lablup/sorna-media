var webpack = require("webpack");

module.exports = {
  entry: {
    main: "./assets/js/main.js"
  },
  output: {
    path: "./assets/[hash]/js",
    publicPath: "/[hash]/js/",
    filename: "[name].min.js",
  },
  devtool: '#cheap-module-source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ]
};

// vim: sts=2 sw=4 et
