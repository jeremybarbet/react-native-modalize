import React from 'react';
import { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

export const hasAbsoluteStyle = (Component: ReactNode): boolean => {
  if (!React.isValidElement(Component)) {
    return false;
  }

  // @ts-ignore
  const element = typeof Component === 'object' ? Component : Component();
  const style: ViewStyle = Component && StyleSheet.flatten(element.props.style);

  return style && style.position === 'absolute';
};
