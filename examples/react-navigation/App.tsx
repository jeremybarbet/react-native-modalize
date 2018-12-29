import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { AbsoluteHeader, DefaultContent, FixedContent, InputForm, SnappingList } from 'shared';

import Home from './src/screens/home/Home';
import Modal from './src/screens/modal/Modal';

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
  console.log('-context', context);

  const modals = [
    { id: 'MODAL_DEFAULT', component: <DefaultContent /> },
    { id: 'MODAL_FIXED', component: <FixedContent /> },
    { id: 'MODAL_SNAPPING', component: <SnappingList /> },
    { id: 'MODAL_ABSOLUTE', component: <AbsoluteHeader /> },
    { id: 'MODAL_INPUT', component: <InputForm /> },
  ];

  return modals.find(modal => modal.id === context.type)!.component;
}

export default class App extends React.PureComponent {

  static contextType = ModalContext;

  render() {
    return (
      <>
        <AppNavigator />

        <ModalContext.Consumer>
          {(context: IState) => <Modalize context={context} />}
        </ModalContext.Consumer>
      </>
    );
  }
}
