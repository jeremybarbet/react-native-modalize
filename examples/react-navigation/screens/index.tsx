import * as React from 'react';
import { createSwitchNavigator, createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import Home from '../screens/Home';
import Modal from '../screens/Modal';
import { View } from 'react-native';

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
  { Modal },
  { headerMode: 'none' },
);

ModalStack.navigationOptions = {
  tabBarIcon: ({ focused }: { focused: boolean }) => <Icon focused={focused} />,
  tabBarLabel: 'Modal',
};

export default createBottomTabNavigator(
  {
    Home: HomeStack,
    Modal: ModalStack,
  },
  {

  },
  // {
  //   initialRouteName: 'Home',
  //   navigationOptions: ({ navigation }) => ({
  //     tabBarVisible: navigation.state.index === 1,
  //   }),
  // },
);

/*
export default createSwitchNavigator(
  {
    Main: createBottomTabNavigator({
      HomeStack,
      ModalStack,
    }),
    Modal: {
      screen: Modal,
      navigationOptions: () => ({
        gesturesEnabled: false,
      }),
      transitionConfig: () => ({
        screenInterpolator: () => {},
      }),
    },
  },
  // {
  //   mode: 'modal',
  //   headerMode: 'none',
  //   transitionConfig: () => ({
  //     screenInterpolator: () => {},
  //   }),
  // },
);
*/
