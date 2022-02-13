import React, { ReactNode, useState } from 'react';
import { LayoutChangeEvent, Platform, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { useInternal } from '../context/InternalProvider';
import { useProps } from '../context/PropsProvider';
import { useDimensions } from '../hooks/use-dimensions';
import { isAndroid, isIphoneX } from '../utils/devices';
import { renderElement } from '../utils/render-element';

export enum ElementType {
  header = 'header',
  footer = 'footer',
  floating = 'floating',
}

interface ElementProps {
  id: ElementType;
  component: ReactNode;
}

export const Element = ({ id, component }: ElementProps) => {
  const {
    modalTopOffset = Platform.select({
      ios: 0,
      android: StatusBar.currentHeight || 0,
      default: 0,
    }),
    modalHeight,
    handlePosition,
    panGestureEnabled = true,
    panGestureComponentEnabled,
    adjustToContentHeight,
    disableScrollIfPossible,
    withHandle,
  } = useProps();
  const { setDisableScroll } = useInternal();
  const { height: screenHeight } = useDimensions();
  const isHandleOutside = handlePosition === 'outside';
  const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
  const fullHeight = screenHeight - modalTopOffset;
  const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
  const endHeight = modalHeight || computedHeight;
  const [layouts, setLayouts] = useState<Map<string, number>>(new Map());
  const dragY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)

    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
    })
    .onEnd(() => {
      dragY.value = 0;
    });

  const handleComponentLayout = (
    { nativeEvent }: LayoutChangeEvent,
    id: ElementType,
    absolute: boolean,
  ): void => {
    /**
     * We don't want to disable the scroll if we are not using adjustToContentHeight props.
     * Also, if the component is in absolute positioning we don't want to take in
     * account its dimensions, so we just skip.
     */
    if (!adjustToContentHeight || absolute) {
      return;
    }

    const { height } = nativeEvent.layout;

    setLayouts(new Map(layouts.set(id, height)));

    const max = Array.from(layouts).reduce((acc, cur) => acc + cur?.[1], 0);
    const maxFixed = +max.toFixed(3);
    const endHeightFixed = +endHeight.toFixed(3);
    const shorterHeight = maxFixed < endHeightFixed;

    setDisableScroll(shorterHeight && disableScrollIfPossible);
  };

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
  const absolute = obj?.position === 'absolute';
  const zIndex: number | undefined = obj?.zIndex;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={{ zIndex }}
        onLayout={(e: LayoutChangeEvent): void => handleComponentLayout(e, id, absolute)}
      >
        {tag}
      </Animated.View>
    </GestureDetector>
  );
};
