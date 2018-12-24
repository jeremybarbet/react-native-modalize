import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import App from './src/App';

Navigation.registerComponent('modalize.homeScreen', () => gestureHandlerRootHOC(App));

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({ root: { component: { name: 'modalize.homeScreen' } } });
});
