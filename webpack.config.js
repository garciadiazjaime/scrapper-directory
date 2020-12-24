const path = require('path');
const fs = require('fs');
const TARGET = process.env.npm_lifecycle_event;
const nodeModules = {};
let entry = '';
let filename = '';
if (TARGET === 'webpack' || !TARGET) {
  entry = './src/server.js';
  filename = 'server.js';
} else if (TARGET === 'webpack-cron-maps') {
  entry = './src/cron/cronMaps/index.js';
  filename = 'cronMaps.js';
} else if (TARGET === 'webpack-cron-image') {
  entry = './src/cron/cronImage/index.js';
  filename = 'cronImage.js';
} else if (TARGET === 'webpack-cron-description') {
  entry = './src/cron/cronDescription/index.js';
  filename = 'cronDescription.js';
} else if (TARGET === 'webpack-cron-facebook') {
  entry = './src/cron/cronFacebook/index.js';
  filename = 'cronFacebook.js';
} else if (TARGET === 'webpack-cron-yelp') {
  entry = './src/cron/cronYelp/index.js';
  filename = 'cronYelp.js';
} else if (TARGET === 'webpack-cron-foursquare') {
  entry = './src/cron/cronFoursquare/index.js';
  filename = 'cronFoursquare.js';
} else if (TARGET === 'webpack-cron-weight') {
  entry = './src/cron/cronWeight/index.js';
  filename = 'cronWeight.js';
} else if (TARGET === 'webpack-cron-ganalytics') {
  entry = './src/cron/cronGanalytics/index.js';
  filename = 'cronGanalytics.js';
}

fs.readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  context: __dirname,
  entry,
  target: 'node',
  output: {
    path: `${__dirname}/build`,
    filename,
    libraryTarget: 'commonjs2',
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /(node_modules|bower_components)/,
      include: [
        path.resolve(__dirname, 'src'),
      ],
    }],
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0'],
        plugins: ['transform-decorators-legacy'],
      },
    }, {
      test: /\.json?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'json-loader',
    }],
  },
  externals: nodeModules,
};
