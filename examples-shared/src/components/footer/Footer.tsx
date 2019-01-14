import * as React from 'react';
import { View, StyleSheet, Text, Linking } from 'react-native';

const Footer = () => (
  <View style={s.footer}>
    <Text style={s.footer__copy}>
      Created by <Text style={s.footer__author} onPress={() => Linking.openURL('https://github.com/jeremybarbet')}>Jérémy Barbet</Text> — v1.0.0-alpha.22
    </Text>
  </View>
);

const s = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 40,
  },

  footer__copy: {
    fontSize: 12,
    color: '#b5b5b5',
  },

  footer__author: {
    color: '#404040',
  },
});

export default Footer;
