import React, { Component } from 'react';
import { NavigationActions, createStackNavigator, createBottomTabNavigator, addNavigationHelpers, createSwitchNavigator, StackViewTransitionConfigs, createAppContainer } from 'react-navigation';

import { SignIn, List, Tab_1, Tab_2, Filter, Alerts } from 'screens';


const TabStack = createBottomTabNavigator(
  {
    tab_1: {
      screen: Tab_1,
    },
    tab_2: {
      screen: Tab_2,
    },
  },
  {
    tabBarOptions: {
      activeTintColor: 'red',
      inactiveTintColor: 'grey',
      style: {
        backgroundColor: '#f9f9f9',
      },

    }
  }
);


const AppStack = createStackNavigator({
  addAccount: { screen: SignIn },
  alerts : { screen: Alerts },
  list: { screen: List },
  filter: { screen: Filter },
  detail : { screen: TabStack }
},{
  initialRouteName: 'list',
  mode: 'card',
  headerLayoutPreset: 'center',
  headerBackTitleVisible: false,
  defaultNavigationOptions: ( { navigation, screenProps } ) => {

    return {
      title: navigation.state.routeName,
      headerBackTitle: null,
      gesturesEnabled: true,
      headerStyle: {
        backgroundColor: 'red',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }
  },
});


const AuthStack = createStackNavigator({
  signIn: {
    screen: SignIn,
    navigationOptions: ({ navigation }) => {
      return ({ title: 'SignIn' })
    },
  },
},{
  defaultNavigationOptions: {
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerStyle: {
      backgroundColor: 'red',
    },
  }
});

const Navigator = createSwitchNavigator(
  {
    app: AppStack,
    auth: AuthStack,
  },
  {
    initialRouteName: 'app',
  }
);

export const AppContainer = createAppContainer(Navigator);
