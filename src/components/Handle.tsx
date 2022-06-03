import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { Style } from '../options';

export const Handle = () => {
  const { panGestureEnabled, withHandle, handleStyle } = useInternalProps();
  const {
    componentTranslateY,
    beginDragY,
    isHandleOutside,
    handleGestureUpdate,
    handleGestureEnd,
  } = useInternalLogic();
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

  const handleStyles: (Style | undefined)[] = [
    s.handle,
    ...(!isHandleOutside ? [s.handleBottom] : []),
  ];

  const shapeStyles: (Style | undefined)[] = [
    s.handle__shape,
    ...(!isHandleOutside ? [s.handle__shapeBottom] : []),
    handleStyle,
  ];

  if (!withHandle) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={handleStyles}>
        <View style={shapeStyles} />
      </Animated.View>
    </GestureDetector>
  );
};

const s = StyleSheet.create({
  handle: {
    position: 'absolute',
    top: -20,
    right: 0,
    left: 0,
    zIndex: 5,

    paddingBottom: 20,

    height: 20,
  },

  handleBottom: {
    top: 0,
  },

  handle__shape: {
    alignSelf: 'center',

    top: 8,

    width: 45,
    height: 5,

    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },

  handle__shapeBottom: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
