import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => <View style={s.layout}>{children}</View>;

const s = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    padding: 15,

    backgroundColor: '#fafafa',
  },
});
