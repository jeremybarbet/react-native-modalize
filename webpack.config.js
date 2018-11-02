const path = require('path');

module.exports = {
  entry: './src/index.ts',

  externals: {
    react: 'react',
  },

  resolve: {
    modules: ['./src'],
    extensions: ['.tsx', '.ts'],
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

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
  },
};
