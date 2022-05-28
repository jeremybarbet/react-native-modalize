import React, { ReactNode, RefObject } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import {
  GestureEvent,
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, { SharedValue } from 'react-native-reanimated';

import { Props } from '../options';
import { constants } from '../utils/constants';
import { isRNGH2 } from '../utils/libraries';
import { isWeb } from '../utils/platform';

import { Content } from './Content';

interface ChildProps {
  children: ReactNode;
  panGestureEnabled: Props['panGestureEnabled'];
  adjustToContentHeight: Props['adjustToContentHeight'];
  flatListProps: Props['flatListProps'];
  sectionListProps: Props['sectionListProps'];
  scrollViewProps: Props['scrollViewProps'];
  childrenStyle: Props['childrenStyle'];
  rendererRef: Props['rendererRef'];
  enableBounces: boolean;
  keyboardToggle: boolean;
  disableScroll?: boolean;
  beginScrollY: SharedValue<number>;
  nativeViewChildrenRef: RefObject<NativeViewGestureHandler>;
  tapGestureModalizeRef: RefObject<TapGestureHandler>;
  panGestureChildrenRef: RefObject<PanGestureHandler>;
  onLayout({ nativeEvent }: LayoutChangeEvent): void;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: PanGestureHandlerStateChangeEvent): void;
}

export const Child = ({
  children,
  panGestureEnabled,
  adjustToContentHeight,
  flatListProps,
  sectionListProps,
  scrollViewProps,
  childrenStyle,
  rendererRef,
  enableBounces,
  keyboardToggle,
  disableScroll,
  beginScrollY,
  nativeViewChildrenRef,
  tapGestureModalizeRef,
  panGestureChildrenRef,
  onLayout,
  onGestureEvent,
  onHandlerStateChange,
}: ChildProps) => {
  const style = adjustToContentHeight ? s.child__adjustHeight : s.child__container;
  const minDist = isRNGH2() ? undefined : constants.activated;

  return (
    <PanGestureHandler
      ref={panGestureChildrenRef}
      enabled={panGestureEnabled}
      simultaneousHandlers={[nativeViewChildrenRef, tapGestureModalizeRef]}
      shouldCancelWhenOutside={false}
      onGestureEvent={onGestureEvent}
      minDist={minDist}
      activeOffsetY={constants.activated}
      activeOffsetX={constants.activated}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[style, childrenStyle]}>
        <NativeViewGestureHandler
          ref={nativeViewChildrenRef}
          waitFor={tapGestureModalizeRef}
          simultaneousHandlers={panGestureChildrenRef}
        >
          <Content
            flatListProps={flatListProps}
            sectionListProps={sectionListProps}
            scrollViewProps={scrollViewProps}
            rendererRef={rendererRef}
            enableBounces={enableBounces}
            keyboardToggle={keyboardToggle}
            disableScroll={disableScroll}
            beginScrollY={beginScrollY}
            onLayout={onLayout}
          >
            {children}
          </Content>
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
