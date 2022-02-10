import React, { ReactNode, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { isAndroid, isIos, isIphoneX } from '../utils/devices';
import { renderElement } from '../utils/render-element';
import { useDimensions } from '../utils/use-dimensions';

interface ElementProps {
  id: string;
  component: ReactNode;
  panGestureComponentEnabled: boolean;
}

export const Element = ({
  id,
  component,
  panGestureComponentEnabled,
}: ElementProps): JSX.Element | null => {
  const { height: screenHeight } = useDimensions();
  const isHandleOutside = handlePosition === 'outside';
  const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
  const fullHeight = screenHeight - modalTopOffset;
  const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
  const endHeight = modalHeight || computedHeight;
  const adjustValue = adjustToContentHeight ? undefined : endHeight;
  const snaps = snapPoint ? [0, endHeight - snapPoint, endHeight] : [0, endHeight];

  const [disableScroll, setDisableScroll] = useState(alwaysOpen || snapPoint ? true : undefined);

  const [layouts, setLayouts] = useState<Map<string, number>>(new Map());

  const dragY = useSharedValue(0);

  const tapGestureModalizeRef = useRef<TapGestureHandler | null>(null);

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .simultaneousWithExternalGesture(tapGestureModalizeRef)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
    })
    .onEnd(() => {
      dragY.value = 0;
    });

  const handleBaseLayout = (
    component: 'content' | 'header' | 'footer' | 'floating',
    height: number,
  ): void => {
    setLayouts(new Map(layouts.set(component, height)));

    const max = Array.from(layouts).reduce((acc, cur) => acc + cur?.[1], 0);
    const maxFixed = +max.toFixed(3);
    const endHeightFixed = +endHeight.toFixed(3);
    const shorterHeight = maxFixed < endHeightFixed;

    setDisableScroll(shorterHeight && disableScrollIfPossible);
  };

  const handleComponentLayout = (
    { nativeEvent }: LayoutChangeEvent,
    name: 'header' | 'footer' | 'floating',
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

    handleBaseLayout(name, nativeEvent.layout.height);
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
  const absolute: boolean = obj?.position === 'absolute';
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
