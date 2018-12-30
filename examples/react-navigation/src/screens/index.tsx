import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import Home from './home/Home';
import ModalConsumer from './modal/ModalConsumer';

const Icon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 18,
      height: 18,
      backgroundColor: focused ? '#2f95dc' : '#ccc',
      borderRadius: 18,
    }}
  />
);

const HomeStack = createStackNavigator(
  { Home },
  { headerMode: 'none' },
);

HomeStack.navigationOptions = {
  tabBarIcon: ({ focused }: { focused: boolean }) => <Icon focused={focused} />,
  tabBarLabel: 'Home',
};

const ModalStack = createStackNavigator(
  { Modal: ModalConsumer },
  { headerMode: 'none' },
);

ModalStack.navigationOptions = {
  tabBarIcon: ({ focused }: { focused: boolean }) => <Icon focused={focused} />,
  tabBarLabel: 'Modal',
};

export default createBottomTabNavigator({
  Home: HomeStack,
  Modal: ModalStack,
});
