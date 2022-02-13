import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useInternal } from '../context/InternalProvider';
import { useProps } from '../context/PropsProvider';
import { useDimensions } from '../hooks/use-dimensions';
import { Close, Position } from '../options';
import { constants } from '../utils/constants';
import { isWeb } from '../utils/devices';

interface OverlayProps {
  showContent: boolean;
  modalPosition: Position;
  onClose(dest?: Close, callback?: () => void): void;
}

export const Overlay = ({ showContent, modalPosition, onClose }: OverlayProps) => {
  const {
    panGestureEnabled = true,
    overlayStyle,
    alwaysOpen,
    closeOnOverlayTap,
    withOverlay,
    onOverlayPress,
  } = useProps();
  const { height } = useDimensions();
  const { dragY, overlay } = useInternal();

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

  const viewStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

  if (!withOverlay) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 0,
          height: isWeb ? height : undefined,
        }}
        pointerEvents={pointerEvents}
      >
        {showContent && (
          <GestureDetector gesture={tapGesture}>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                },
                overlayStyle,
                viewStyle,
              ]}
              pointerEvents={pointerEvents}
            />
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
};
