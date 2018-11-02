const path = require('path');

module.exports = {
  entry: './src/index.ts',

  externals: {
    react: 'react',
    'react-native': 'react-native',
    'react-native-gesture-handler': 'react-native-gesture-handler',
  },

  resolve: {
    modules: ['./src'],
    extensions: ['.tsx', '.ts'],

    alias: {
      'react': path.join(__dirname, 'node_modules/react'),
      'react-native': path.join(__dirname, 'node_modules/react-native'),
      'react-native-gesture-handler': path.join(__dirname, 'node_modules/react-native-gesture-handler'),
    },
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
