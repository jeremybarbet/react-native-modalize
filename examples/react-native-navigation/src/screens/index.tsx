import { Navigation } from 'react-native-navigation';

import Home from './home/Home';
import Modal from './modal/Modal';
import Modalize from './modalize/Modalize';

export const HOME = 'modalize.Home';
export const MODAL = 'modalize.Modal';
export const MODALIZE = 'modalize.Modalize';

export const Screens = new Map();

Screens.set(HOME, Home);
Screens.set(MODAL, Modal);
Screens.set(MODALIZE, Modalize);

const options = {
  textColor: '#ccc',
  selectedTextColor: '#2f95dc',
  icon: require('../assets/bottom-bar-icon.png'),
  selectedIconColor: '#2f95dc',
};

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
                  ...options,
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
                  ...options,
                },
              },
            },
          },
        ],
      },
    },
  });
};
