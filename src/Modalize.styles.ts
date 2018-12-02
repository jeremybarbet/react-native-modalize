import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  wrapper: {
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

  wrapper__scrollview: {
    overflow: 'hidden',
  },

  overlay: {
    zIndex: 0,

    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },

  component: {
    zIndex: 20,
  },

  handle: {
    position: 'absolute',
    top: -20,
    right: 0,
    left: 0,
    zIndex: 20,

    paddingBottom: 20,

    height: 20,
  },

  handleBottom: {
    top: 0,
  },

  handle__shape: {
    alignSelf: 'center',

    top: 8,

    width: 45,
    height: 5,

    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  handle__shapeBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
