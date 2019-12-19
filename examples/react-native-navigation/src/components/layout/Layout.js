import React from 'react';
import { View, StyleSheet } from 'react-native';

export const Layout = ({ children }) => <View style={s.app}>{children}</View>;

const s = StyleSheet.create({
  app: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    padding: 15,

    backgroundColor: '#fafafa',
  },
});
