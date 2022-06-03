import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle } from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { height } from '../utils/dimensions';
import { isWeb } from '../utils/platform';

export const Overlay = () => {
  const {
    alwaysOpen,
    panGestureEnabled,
    withOverlay,
    closeOnOverlayTap,
    overlayStyle,
    onOverlayPress,
  } = useInternalProps();
  const {
    overlay,
    modalPosition,
    showContent,
    willCloseModalize,
    handleGestureUpdate,
    handleGestureEnd,
    handleClose,
  } = useInternalLogic();
  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .onUpdate(handleGestureUpdate)
    .onEnd(handleGestureEnd);

  const handleTapPress = () => {
    if (!willCloseModalize.current) {
      onOverlayPress?.();
      handleClose(!!alwaysOpen ? 'alwaysOpen' : 'default');
    }
  };

  const tapGesture = Gesture.Tap()
    .enabled(closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled)
    .onStart(() => {
      runOnJS(handleTapPress)();
    });

  const gestures = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  if (!withOverlay) {
    return null;
  }

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
        {showContent && (
          <Animated.View
            style={[s.overlay__background, overlayStyle, animatedStyle]}
            pointerEvents={pointerEvents}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 0,

    height: isWeb ? height : undefined,
  },

  overlay__background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
});
