import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Close, ModalizeProps, Position } from '../options';
import s from '../styles';
import { constants } from '../utils/constants';

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
  onOverlayPress: ModalizeProps['onOverlayPress'];
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
  onOverlayPress,
}: OverlayProps): JSX.Element | null => {
  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
      overlay.value = interpolate(translationY, [0, 1000], [1, 0]);
    })
    .onEnd(({ translationY }) => {
      // TODO: dynamic threshold
      if (translationY < 120) {
        dragY.value = withSpring(0, {
          damping: 50,
          mass: 0.3,
          stiffness: 120,
        });

        overlay.value = withSpring(1, constants.springConfig);
      } else {
        runOnJS(onClose)();
      }
    });

  const tapGesture = Gesture.Tap()
    .enabled(closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled)
    .onStart(() => {
      // split functions from native thread and js thread
      runOnJS(onClose)(!!alwaysOpen ? 'alwaysOpen' : 'default');

      if (onOverlayPress) {
        runOnJS(onOverlayPress)();
      }
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
