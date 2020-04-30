const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias['react-native'] = 'react-native-web';
  config.resolve.alias['react-native-webview'] = 'react-native-web-webview';

  return config;
};
