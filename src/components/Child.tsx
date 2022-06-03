import React, { ReactNode, RefObject, useRef } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { constants } from '../utils/constants';
import { isWeb } from '../utils/platform';

import { Renderer } from './Renderer';

interface ChildProps {
  children: ReactNode;
  tapGestureRef: RefObject<TapGestureHandler>;
  onLayout({ nativeEvent }: LayoutChangeEvent): void;
}

export const Child = ({ children, tapGestureRef, onLayout }: ChildProps) => {
  const { panGestureEnabled, adjustToContentHeight, childrenStyle } = useInternalProps();
  const {
    // TODO
    deprecated__handleChildren,
    // TODO
    deprecated__handleGestureEvent,
  } = useInternalLogic();
  const childRef = useRef<PanGestureHandler | null>(null);
  const rendererRef = useRef<NativeViewGestureHandler | null>(null);
  const style = adjustToContentHeight ? s.child__adjustHeight : s.child__container;

  return (
    <PanGestureHandler
      ref={childRef}
      enabled={panGestureEnabled}
      activeOffsetY={constants.activated}
      simultaneousHandlers={[rendererRef, tapGestureRef]}
      shouldCancelWhenOutside={false}
      onGestureEvent={deprecated__handleGestureEvent}
      onHandlerStateChange={deprecated__handleChildren}
    >
      <Animated.View style={[style, childrenStyle]}>
        <NativeViewGestureHandler
          ref={rendererRef}
          waitFor={tapGestureRef}
          simultaneousHandlers={childRef}
        >
          <Renderer onLayout={onLayout}>{children}</Renderer>
        </NativeViewGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const s = StyleSheet.create({
  child__container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
  },

  child__adjustHeight: {
    flex: isWeb ? 1 : 0,
    flexGrow: isWeb ? undefined : 0,
    flexShrink: isWeb ? undefined : 1,
  },
});
