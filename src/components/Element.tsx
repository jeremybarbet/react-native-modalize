import React, { ReactNode } from 'react';
import { LayoutChangeEvent, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { renderElement } from '../utils/render-element';

export enum ElementType {
  header = 'header',
  footer = 'footer',
  floating = 'floating',
}

interface ElementProps {
  id: ElementType;
  component: ReactNode;
  onComponentLayout(event: LayoutChangeEvent, name: ElementType, absolute: boolean): void;
}

export const Element = ({ id, component, onComponentLayout }: ElementProps) => {
  const { panGestureEnabled } = useInternalProps();
  const { componentTranslateY, beginDragY, handleGestureUpdate, handleGestureEnd } =
    useInternalLogic();

  if (!component) {
    return null;
  }

  const tag = renderElement(component);
  const obj: ViewStyle = StyleSheet.flatten(tag?.props?.style);
  const absolute: boolean = obj?.position === 'absolute';
  const zIndex: number | undefined = obj?.zIndex;

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .onBegin(() => {
      'worklet';

      componentTranslateY.value = 1;
      beginDragY.value = 0;
    })
    .onUpdate(handleGestureUpdate)
    .onEnd(handleGestureEnd);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{ zIndex }} onLayout={event => onComponentLayout(event, id, absolute)}>
        {tag}
      </Animated.View>
    </GestureDetector>
  );
};
