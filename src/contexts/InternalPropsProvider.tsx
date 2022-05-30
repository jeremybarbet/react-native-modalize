import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';

import { Props } from '../options';

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

type ReturnProps<T, K> = WithRequiredProperty<
  Props<T, K>,
  | 'modalTopOffset'
  | 'adjustToContentHeight'
  | 'handlePosition'
  | 'disableScrollIfPossible'
  | 'avoidKeyboardLikeIOS'
  | 'keyboardAvoidingBehavior'
  | 'panGestureEnabled'
  | 'tapGestureEnabled'
  | 'closeOnOverlayTap'
  | 'closeSnapPointStraightEnabled'
  | 'withHandle'
  | 'withOverlay'
>;

const InternalPropsContext = createContext({} as ReturnProps<any, any>);

const defaultProps = {
  modalTopOffset: Platform.select({
    ios: 0,
    android: 0,
    default: 0,
  }),
  adjustToContentHeight: false,
  handlePosition: 'outside',
  disableScrollIfPossible: true,
  avoidKeyboardLikeIOS: Platform.select({
    ios: true,
    android: false,
    default: true,
  }),
  keyboardAvoidingBehavior: 'padding',
  panGestureEnabled: true,
  tapGestureEnabled: true,
  closeOnOverlayTap: true,
  closeSnapPointStraightEnabled: true,
  withHandle: true,
  withOverlay: true,
} as Props;

export const InternalPropsProvider = <T, K>({ children, ...props }: ReturnProps<T, K>) => (
  <InternalPropsContext.Provider
    value={{
      ...defaultProps,
      ...props,
    }}
  >
    {children}
  </InternalPropsContext.Provider>
);

export const useInternalProps = () => useContext(InternalPropsContext);
