import * as React from 'react';
import { View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import Home from './home';
import Modal from './modal';

export const HOME = 'modalize.Home';
export const MODAL = 'modalize.Modal';

export const Screens = new Map();

Screens.set(HOME, Home);
Screens.set(MODAL, Modal);

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

export const startApp = () => {
  Navigation.setRoot({
    root: {
      bottomTabs: {
        children: [
        {
          component: {
            name: HOME,
            options: {
              bottomTab: {
                text: 'Home',
              },
            },
          },
        },
        {
          component: {
            name: MODAL,
            options: {
              bottomTab: {
                text: 'Modal',
              }
            }
          }
        }]
      }
    },
  });
};
