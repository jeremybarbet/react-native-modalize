import React, { createContext, ReactNode, useContext } from 'react';
import { Platform, StatusBar } from 'react-native';

import { Props } from '../options';

const InternalPropsContext = createContext<Props>({});

type InternalPropsProviderProps<T> = { children: ReactNode } & Props<T>;

const defaultProps = {
  modalTopOffset: Platform.select({
    ios: 0,
    android: StatusBar.currentHeight || 0,
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
  panGestureComponentEnabled: false,
  tapGestureEnabled: true,
  closeOnOverlayTap: true,
  closeSnapPointStraightEnabled: true,
  withHandle: true,
  withOverlay: true,
} as Props;

export const InternalPropsProvider = <T,>({
  children,
  ...props
}: InternalPropsProviderProps<T>) => (
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
