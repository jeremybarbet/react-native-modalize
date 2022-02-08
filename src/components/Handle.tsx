import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue } from 'react-native-reanimated';

import { ModalizeProps } from '../options';
import s from '../styles';

interface HandleProps {
  dragY: SharedValue<number>;
  panGestureEnabled: ModalizeProps['panGestureEnabled'];
  handlePosition: ModalizeProps['handlePosition'];
  handleStyle: ModalizeProps['handleStyle'];
  withHandle: ModalizeProps['withHandle'];
}

export const Handle = ({
  dragY,
  panGestureEnabled = true,
  handlePosition,
  handleStyle,
  withHandle,
}: HandleProps): JSX.Element | null => {
  const isHandleOutside = handlePosition === 'outside';

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    // TODO pass down props
    // .simultaneousWithExternalGesture(tapGestureModalizeRef)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;

      /* TODO
      if (panGestureAnimatedValue) {
        const offset = alwaysOpen ?? snapPoint ?? 0;
        const diff = Math.abs(translationY / (endHeight - offset));
        const y = translationY <= 0 ? diff : 1 - diff;
        let value: number;

        if (modalPosition === 'initial' && translationY > 0) {
          value = 0;
        } else if (modalPosition === 'top' && translationY <= 0) {
          value = 1;
        } else {
          value = y;
        }

        panGestureAnimatedValue.value = value;
      }
       */
    })
    .onEnd(() => {
      // TODO: either close or reset to initial position
      dragY.value = 0;
    });

  if (!withHandle) {
    return null;
  }

  const handleStyles = [s.handle, ...(!isHandleOutside ? [s.handleBottom] : [])];

  const shapeStyles = [
    s.handle__shape,
    ...(!isHandleOutside ? [s.handle__shapeBottom] : []),
    handleStyle,
  ];

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={handleStyles}>
        <View style={shapeStyles} />
      </Animated.View>
    </GestureDetector>
  );
};
