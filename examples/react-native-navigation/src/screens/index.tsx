import { Navigation } from 'react-native-navigation';

import Home from './home/Home';
import Modal from './modal/Modal';
import ModalDefault from './modal/DefaultContent';
import ModalFixed from './modal/FixedContent';
import ModalSnapping from './modal/SnappingList';
import ModalAbsolute from './modal/AbsoluteHeader';
import ModalInput from './modal/InputForm';

export const HOME = 'modalize.Home';
export const MODAL = 'modalize.Modal';
export const MODAL_DEFAULT = 'modalize.Modal.DefaultContent';
export const MODAL_FIXED = 'modalize.Modal.FixedContent';
export const MODAL_SNAPPING = 'modalize.Modal.SnappingList';
export const MODAL_ABSOLUTE = 'modalize.Modal.AbsoluteHeader';
export const MODAL_INPUT = 'modalize.Modal.InputForm';

export const Screens = new Map();

Screens.set(HOME, Home);
Screens.set(MODAL, Modal);
Screens.set(MODAL_DEFAULT, ModalDefault);
Screens.set(MODAL_FIXED, ModalFixed);
Screens.set(MODAL_SNAPPING, ModalSnapping);
Screens.set(MODAL_ABSOLUTE, ModalAbsolute);
Screens.set(MODAL_INPUT, ModalInput);

const options = {
  textColor: '#ccc',
  selectedTextColor: '#2f95dc',
  icon: require('assets/bottom-bar-icon.png'),
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
