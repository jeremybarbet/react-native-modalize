import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ExamplesScreen } from '../screens/Examples';
import { SettingsScreen } from '../screens/Settings';

const Tab = createBottomTabNavigator();

export const Tabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Examples" component={ExamplesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
