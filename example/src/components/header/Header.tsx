import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

export const Header = () => (
  <View style={s.header}>
    <Text style={s.header__heading}>Modalize</Text>

    <Text style={s.header__copy}>
      Created by{' '}
      <Text
        style={s.header__author}
        onPress={() => Linking.openURL('https://github.com/jeremybarbet')}
      >
        Jérémy Barbet
      </Text>{' '}
      — v2.0.13
    </Text>
  </View>
);

const s = StyleSheet.create({
  header: {
    paddingBottom: 40,
  },

  header__heading: {
    marginBottom: 5,

    fontSize: 28,
    color: '#404040',
    textAlign: 'center',
  },

  header__subheading: {
    fontSize: 16,
    color: '#b5b5b5',
    textAlign: 'center',
  },

  header__copy: {
    marginTop: 10,
    marginHorizontal: 30,

    fontSize: 14,
    color: '#b5b5b5',
    textAlign: 'center',
  },

  header__author: {
    color: '#404040',
  },
});
