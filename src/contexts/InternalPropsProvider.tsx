import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';

import { Props } from '../options';

const InternalPropsContext = createContext<Props>({});

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
  closeSnapPointsStraightEnabled: true,
  withHandle: true,
  withOverlay: true,
} as Props;

export const InternalPropsProvider = <T, K>({ children, ...props }: Props<T, K>) => (
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
