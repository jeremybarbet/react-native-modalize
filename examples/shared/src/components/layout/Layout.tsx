import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => (
  <View style={s.app}>
    {children}
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
});

export default Layout;
