import React, { ReactNode } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, ViewStyle } from 'react-native';
import {
  GestureEvent,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

import { Props } from '../options';
import { isAndroid } from '../utils/platform';
import { renderElement } from '../utils/render-element';

export enum ElementType {
  header = 'header',
  footer = 'footer',
  floating = 'floating',
}

interface ElementProps {
  id: ElementType;
  component: ReactNode;
  panGestureEnabled: Props['panGestureEnabled'];
  panGestureComponentEnabled: Props['panGestureComponentEnabled'];
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>): void;
  onComponentLayout({ nativeEvent }: LayoutChangeEvent, name: ElementType, absolute: boolean): void;
}

export const Element = ({
  id,
  component,
  panGestureEnabled,
  panGestureComponentEnabled,
  onGestureEvent,
  onHandlerStateChange,
  onComponentLayout,
}: ElementProps) => {
  if (!component) {
    return null;
  }

  const tag = renderElement(component);

  /**
   * Nesting Touchable/ScrollView components with RNGH PanGestureHandler cancels the inner events.
   * Until a better solution lands in RNGH, I will disable the PanGestureHandler for Android only,
   * so inner touchable/gestures are working from the custom components you can pass in.
   */
  if (isAndroid && !panGestureComponentEnabled) {
    return tag;
  }

  const obj: ViewStyle = StyleSheet.flatten(tag?.props?.style);
  const absolute: boolean = obj?.position === 'absolute';
  const zIndex: number | undefined = obj?.zIndex;

  return (
    <PanGestureHandler
      enabled={panGestureEnabled}
      shouldCancelWhenOutside={false}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={{ zIndex }}
        onLayout={(e: LayoutChangeEvent): void => onComponentLayout(e, id, absolute)}
      >
        {tag}
      </Animated.View>
    </PanGestureHandler>
  );
};
