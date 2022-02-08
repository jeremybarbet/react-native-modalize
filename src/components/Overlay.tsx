import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Close, ModalizeProps, Position } from '../options';
import s from '../styles';

interface OverlayProps {
  dragY: SharedValue<number>;
  overlay: SharedValue<number>;
  panGestureEnabled: ModalizeProps['panGestureEnabled'];
  overlayStyle: ModalizeProps['overlayStyle'];
  alwaysOpen: ModalizeProps['alwaysOpen'];
  closeOnOverlayTap: ModalizeProps['closeOnOverlayTap'];
  withOverlay: ModalizeProps['withOverlay'];
  showContent: boolean;
  modalPosition: Position;
  onClose(dest?: Close, callback?: () => void): void;
}

export const Overlay = ({
  dragY,
  overlay,
  panGestureEnabled = true,
  overlayStyle,
  alwaysOpen,
  closeOnOverlayTap,
  withOverlay,
  showContent,
  modalPosition,
  onClose,
}: OverlayProps): JSX.Element | null => {
  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    // TODO ref props
    .simultaneousWithExternalGesture()
    .shouldCancelWhenOutside(false)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
    })
    .onEnd(({ translationY }) => {
      if (translationY < 120) {
        dragY.value = withSpring(0, {
          damping: 50,
          mass: 0.3,
          stiffness: 120,
        });
      } else {
        runOnJS(onClose)();
      }
    });

  const tapGesture = Gesture.Tap()
    .enabled(closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled)
    .onStart(() => {
      /*
      if (!willCloseModalize) {
        // onOverlayPress?.();
        // handleClose(!!alwaysOpen ? 'alwaysOpen' : 'default');
        runOnJS(handleClose)(!!alwaysOpen ? 'alwaysOpen' : 'default');
      }
      */
    });

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

  if (!withOverlay) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
        {showContent && (
          <GestureDetector gesture={tapGesture}>
            <Animated.View
              style={[s.overlay__background, overlayStyle, animatedOverlayStyle]}
              pointerEvents={pointerEvents}
            />
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );

  /*
  return (
    <PanGestureHandler
      enabled={panGestureEnabled}
      simultaneousHandlers={tapGestureModalizeRef}
      shouldCancelWhenOutside={false}
      onGestureEvent={handleGestureEvent}
      // onHandlerStateChange={handleChildren}
    >
      <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
        {/* {showContent && (
            <TapGestureHandler
              ref={tapGestureOverlayRef}
              enabled={closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled}
              onHandlerStateChange={handleOverlay}
            >
              <Animated.View
                style={[s.overlay__background, overlayStyle, animatedOverlayStyle]}
                pointerEvents={pointerEvents}
              />
            </TapGestureHandler>
          )} *}

        {showContent && (
          <GestureDetector gesture={tapGesture}>
            <Animated.View
              style={[s.overlay__background, overlayStyle, animatedOverlayStyle]}
              pointerEvents={pointerEvents}
            />
          </GestureDetector>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
  */
};
