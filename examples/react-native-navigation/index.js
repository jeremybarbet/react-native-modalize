import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import { App } from './App';

Navigation.registerComponent('navigation.playground.AppScreen', () => gestureHandlerRootHOC(App));

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      component: {
        name: 'navigation.playground.AppScreen',
      },
    },
  });
});
