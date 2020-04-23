import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { Screens, startApp, defaultOptions } from './src/screens';

Screens.forEach((ScreenComponent, key) =>
  Navigation.registerComponent(key, () => gestureHandlerRootHOC(ScreenComponent)),
);

Navigation.events().registerAppLaunchedListener(() => {
  defaultOptions();
  startApp();
});
