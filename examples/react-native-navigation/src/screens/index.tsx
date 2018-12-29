import { Navigation } from 'react-native-navigation';
import { AbsoluteHeader, DefaultContent, FixedContent, InputForm, SnappingList } from 'shared';

import Home from './home/Home';
import Modal from './modal/Modal';
import Modalize from './modalize/Modalize';

export const HOME = 'modalize.Home';
export const MODAL = 'modalize.Modal';
export const MODALIZE = 'modalize.Modalize';
// export const MODAL_ABSOLUTE = 'modalize.Modal.AbsoluteHeader';
// export const MODAL_DEFAULT = 'modalize.Modal.DefaultContent';
// export const MODAL_FIXED = 'modalize.Modal.FixedContent';
// export const MODAL_INPUT = 'modalize.Modal.InputForm';
// export const MODAL_SNAPPING = 'modalize.Modal.SnappingList';

export const Screens = new Map();

Screens.set(HOME, Home);
Screens.set(MODAL, Modal);
Screens.set(MODALIZE, Modalize);
// Screens.set(MODAL_ABSOLUTE, AbsoluteHeader);
// Screens.set(MODAL_DEFAULT, DefaultContent);
// Screens.set(MODAL_FIXED, FixedContent);
// Screens.set(MODAL_INPUT, InputForm);
// Screens.set(MODAL_SNAPPING, SnappingList);

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
