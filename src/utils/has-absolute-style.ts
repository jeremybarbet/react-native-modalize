import * as React from 'react';
import { StyleProp, StyleSheet } from 'react-native';

export const hasAbsoluteStyle = (Component: React.ReactNode): boolean => {
  if (!React.isValidElement(Component)) {
    return false;
  }

  // @ts-ignore
  const element = typeof Component === 'object' ? Component : Component();
  const style: StyleProp<any> = Component && StyleSheet.flatten(element.props.style);

  return style && style.position === 'absolute';
};
