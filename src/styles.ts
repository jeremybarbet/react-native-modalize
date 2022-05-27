import { StyleSheet } from 'react-native';

import { isWeb } from './utils/platform';

export default StyleSheet.create({
  modalize: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9998,
  },

  modalize__wrapper: {
    flex: 1,
  },

  modalize__content: {
    zIndex: 5,

    marginTop: 'auto',

    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,

    elevation: 4,
  },

  content__container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
  },

  content__adjustHeight: {
    flex: isWeb ? 1 : 0,
    flexGrow: isWeb ? undefined : 0,
    flexShrink: isWeb ? undefined : 1,
  },
});
