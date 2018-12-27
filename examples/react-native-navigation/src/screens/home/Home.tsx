import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import Footer from '../../components/footer/Footer';

const HomeScreen = () => (
  <View style={s.app}>
    <Text style={s.app__heading}>Modalize</Text>
    <Text style={s.app__subheading}>Run with React Native Navigation</Text>
    <Text style={s.app__copy}>Go to the modal tab to see all the examples</Text>

    <Footer />
  </View>
);

const s = StyleSheet.create({
  app: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    padding: 15,

    backgroundColor: '#fafafa',
  },

  app__heading: {
    marginBottom: 5,

    fontSize: 28,
    color: '#707070',
  },

  app__subheading: {
    fontSize: 16,
    color: '#b5b5b5',
  },

  app__copy: {
    marginTop: 20,
    marginHorizontal: 40,

    fontSize: 16,
    color: '#b5b5b5',
    textAlign: 'center',
  },
});

export default HomeScreen;
