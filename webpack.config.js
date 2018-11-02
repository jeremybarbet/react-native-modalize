const path = require('path');

module.exports = {
  entry: './src/index.ts',

  // externals: {
  //   react: 'react',
  // },

  resolve: {
    modules: [
      './src',
      'node_modules',
    ],
  },

  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
  },
};
