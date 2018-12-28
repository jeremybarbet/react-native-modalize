import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import Home from './src/screens/home/Home';
import Modal from './src/screens/modal/Modal';

import DefaultContent from './src/components/modals/DefaultContent';
import FixedContent from './src/components/modals/FixedContent';
import SnappingList from './src/components/modals/SnappingList';
import AbsoluteHeader from './src/components/modals/AbsoluteHeader';
import InputForm from './src/components/modals/InputForm';
import { ModalContext, IState } from './src/components/modal-provider/ModalProvider';

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

const AppNavigator = createBottomTabNavigator({
  Home: HomeStack,
  Modal: ModalStack,
});

const Modalize = ({ context }: { context: IState }) => {
  const modals = [
    { id: 'MODAL_DEFAULT', component: <DefaultContent /> },
    { id: 'MODAL_FIXED', component: <FixedContent /> },
    { id: 'MODAL_SNAPPING', component: <SnappingList /> },
    { id: 'MODAL_ABSOLUTE', component: <AbsoluteHeader /> },
    { id: 'MODAL_INPUT', component: <InputForm /> },
  ];

  return modals.find(modal => modal.id === context.type)!.component;
}

const App = () => (
  <ModalContext.Consumer>
    <AppNavigator />
    {(context: IState) => <Modalize context={context} />}
  </ModalContext.Consumer>
);

App.contextType = {
  context: ModalContext,
};

export default App;
