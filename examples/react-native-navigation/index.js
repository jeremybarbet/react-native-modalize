import { Navigation } from 'react-native-navigation';

import { Screens, startApp } from './src/screens';

Screens.forEach((ScreenComponent, key) => Navigation.registerComponent(key, () => ScreenComponent));

Navigation.events().registerAppLaunchedListener(() => {
  startApp();
});
