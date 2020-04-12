import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Host } from 'react-native-portalize';

import { Tabs } from './screens';

export const App = () => (
  <NavigationContainer>
    <Host>
      <Tabs />
    </Host>
  </NavigationContainer>
);
