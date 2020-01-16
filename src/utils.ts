import * as React from 'react';
import { Platform, Dimensions, StyleProp, StyleSheet } from 'react-native';

import { ISpringProps } from './options';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const getSpringConfig = (config: ISpringProps) => {
  const { friction, tension, speed, bounciness, stiffness, damping, mass } = config;

  if (stiffness || damping || mass) {
    if (bounciness || speed || tension || friction) {
      console.error(`
        [react-native-modalize] You can define one of bounciness/speed, tension/friction,
        or stiffness/damping/mass, but not more than one
      `);
    }

    return {
      stiffness,
      damping,
      mass,
    };
  } else if (bounciness || speed) {
    if (tension || friction || stiffness || damping || mass) {
      console.error(`
        [react-native-modalize] You can define one of bounciness/speed, tension/friction,
        or stiffness/damping/mass, but not more than one
      `);
    }

    return {
      bounciness,
      speed,
    };
  }

  return {
    tension,
    friction,
  };
};

export const isIos = Platform.OS === 'ios';
export const isIphoneX =
  isIos &&
  (screenHeight === 812 || screenWidth === 812 || screenHeight === 896 || screenWidth === 896);

export const hasAbsoluteStyle = (Component: React.ReactNode): boolean => {
  if (!React.isValidElement(Component)) {
    return false;
  }

  // @ts-ignore
  const element = typeof Component === 'object' ? Component : Component();
  const style: StyleProp<any> = Component && StyleSheet.flatten(element.props.style);

  return style && style.position === 'absolute';
};
