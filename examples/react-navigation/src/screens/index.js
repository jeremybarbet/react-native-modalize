import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ExamplesScreen } from '../screens/Examples';
import { SettingsScreen } from '../screens/Settings';

const Tab = createBottomTabNavigator();

export const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => (
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 16,
            backgroundColor: focused ? 'rgba(0, 122, 255, 0.8)' : 'rgba(28, 28, 30, 0.3)',
          }}
        />
      ),
      tabBarLabel: ({ focused }) => (
        <Text
          style={{
            fontSize: 10,
            marginBottom: 6,
            color: focused ? 'rgba(0, 122, 255, 0.8)' : 'rgba(28, 28, 30, 0.3)',
          }}
        >
          {route.name}
        </Text>
      ),
    })}
  >
    <Tab.Screen name="Examples" component={ExamplesScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
