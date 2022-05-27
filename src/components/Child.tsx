import React, { ComponentType, ReactNode, RefAttributes, RefObject } from 'react';
import {
  Animated,
  DefaultSectionT,
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  SectionList,
  StyleSheet,
} from 'react-native';
import {
  GestureEvent,
  HandlerStateChangeEvent,
  NativeViewGestureHandler,
  NativeViewGestureHandlerProps,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { Props } from '../options';
import { composeRefs } from '../utils/compose-refs';
import { constants } from '../utils/constants';
import { isRNGH2 } from '../utils/libraries';
import { isIos, isWeb } from '../utils/platform';

interface ChildProps {
  children: ReactNode;
  panGestureEnabled: Props['panGestureEnabled'];
  adjustToContentHeight: Props['adjustToContentHeight'];
  flatListProps: Props['flatListProps'];
  sectionListProps: Props['sectionListProps'];
  scrollViewProps: Props['scrollViewProps'];
  childrenStyle: Props['childrenStyle'];
  contentRef: Props['contentRef'];
  enableBounces: boolean;
  keyboardToggle: boolean;
  disableScroll?: boolean;
  beginScrollY: Animated.Value;
  nativeViewChildrenRef: RefObject<
    ComponentType<NativeViewGestureHandlerProps & RefAttributes<any>>
  >;
  tapGestureModalizeRef: RefObject<TapGestureHandler>;
  contentViewRef: RefObject<ScrollView | FlatList<any> | SectionList<any, DefaultSectionT>>;
  panGestureChildrenRef: RefObject<PanGestureHandler>;
  onLayout({ nativeEvent }: LayoutChangeEvent): void;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>): void;
}

export const Child = ({
  children,
  panGestureEnabled,
  adjustToContentHeight,
  flatListProps,
  sectionListProps,
  scrollViewProps,
  childrenStyle,
  contentRef,
  enableBounces,
  keyboardToggle,
  disableScroll,
  beginScrollY,
  nativeViewChildrenRef,
  tapGestureModalizeRef,
  contentViewRef,
  panGestureChildrenRef,
  onLayout,
  onGestureEvent,
  onHandlerStateChange,
}: ChildProps) => {
  const style = adjustToContentHeight ? s.content__adjustHeight : s.content__container;
  const minDist = isRNGH2() ? undefined : constants.activated;

  const renderContent = () => {
    const keyboardDismissMode:
      | Animated.Value
      | Animated.AnimatedInterpolation
      | 'interactive'
      | 'on-drag' = isIos ? 'interactive' : 'on-drag';
    const passedOnProps = flatListProps ?? sectionListProps ?? scrollViewProps;
    // We allow overwrites when the props (bounces, scrollEnabled) are set to false, when true we use Modalize's core behavior
    const bounces =
      passedOnProps?.bounces !== undefined && !passedOnProps?.bounces
        ? passedOnProps?.bounces
        : enableBounces;
    const scrollEnabled =
      passedOnProps?.scrollEnabled !== undefined && !passedOnProps?.scrollEnabled
        ? passedOnProps?.scrollEnabled
        : keyboardToggle || !disableScroll;
    const scrollEventThrottle = passedOnProps?.scrollEventThrottle || 16;
    const onScrollBeginDrag = passedOnProps?.onScrollBeginDrag as (
      event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => void | undefined;

    const opts = {
      ref: composeRefs(contentViewRef, contentRef) as RefObject<any>,
      bounces,
      onScrollBeginDrag: Animated.event([{ nativeEvent: { contentOffset: { y: beginScrollY } } }], {
        useNativeDriver: constants.useNativeDriver,
        listener: onScrollBeginDrag,
      }),
      scrollEventThrottle,
      onLayout,
      scrollEnabled,
      keyboardDismissMode,
    };

    if (flatListProps) {
      return <Animated.FlatList {...flatListProps} {...opts} />;
    }

    if (sectionListProps) {
      return <Animated.SectionList {...sectionListProps} {...opts} />;
    }

    return (
      <Animated.ScrollView {...scrollViewProps} {...opts}>
        {children}
      </Animated.ScrollView>
    );
  };

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
          {renderContent()}
        </NativeViewGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const s = StyleSheet.create({
  content__container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
  },

  content__adjustHeight: {
    flex: isWeb ? 1 : 0,
    flexGrow: isWeb ? undefined : 0,
    flexShrink: isWeb ? undefined : 1,
  },
});
