import { Navigation } from 'react-native-navigation';

import { Screens, startApp, defaultOptions } from './src/screens';

Screens.forEach((ScreenComponent, key) => Navigation.registerComponent(key, () => ScreenComponent));

Navigation.events().registerAppLaunchedListener(() => {
  defaultOptions();
  startApp();
});
