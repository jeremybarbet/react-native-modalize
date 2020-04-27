import * as React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

export const hasAbsoluteStyle = (Component: React.ReactNode): boolean => {
  if (!React.isValidElement(Component)) {
    return false;
  }

  // @ts-ignore
  const element = typeof Component === 'object' ? Component : Component();
  const style: ViewStyle = Component && StyleSheet.flatten(element.props.style);

  return style && style.position === 'absolute';
};
