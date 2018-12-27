import { Navigation } from 'react-native-navigation';

import { Screens, startApp } from './screens';

// Register screens
Screens.forEach((ScreenComponent, key) => Navigation.registerComponent(key, () => ScreenComponent));

// Start application
Navigation.events().registerAppLaunchedListener(() => {
  // Hydrate store and start app
  startApp();
});
