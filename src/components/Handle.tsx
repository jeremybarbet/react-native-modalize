import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, withSpring } from 'react-native-reanimated';

import { useInternal } from '../context/InternalProvider';
import { useProps } from '../context/PropsProvider';
import { Close } from '../options';
import { constants } from '../utils/constants';

interface HandleProps {
  onClose(dest?: Close, callback?: () => void): void;
}

export const Handle = ({ onClose }: HandleProps) => {
  const { panGestureEnabled = true, handlePosition, handleStyle, withHandle } = useProps();
  const { dragY } = useInternal();
  const isHandleOutside = handlePosition === 'outside';

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
    })
    .onEnd(({ translationY }) => {
      if (translationY < 120) {
        dragY.value = withSpring(0, constants.springConfig);
      } else {
        runOnJS(onClose)();
      }
    });

  if (!withHandle) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={{
          position: 'absolute',
          top: !isHandleOutside ? 0 : -20,
          right: 0,
          left: 0,
          zIndex: 5,
          paddingBottom: 20,
          height: 20,
        }}
      >
        <View
          style={[
            {
              alignSelf: 'center',
              top: 8,
              width: 45,
              height: 5,
              borderRadius: 5,
              backgroundColor: !isHandleOutside ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.8)',
            },
            handleStyle,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
};
