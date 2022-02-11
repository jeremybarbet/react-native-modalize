import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, SharedValue, withSpring } from 'react-native-reanimated';

import { useInternal } from '../context/Internal-provider';
import { ModalizeProps } from '../options';
import s from '../styles';
import { constants } from '../utils/constants';

interface HandleProps {
  dragY: SharedValue<number>;
  panGestureEnabled: ModalizeProps['panGestureEnabled'];
  handlePosition: ModalizeProps['handlePosition'];
  handleStyle: ModalizeProps['handleStyle'];
  withHandle: ModalizeProps['withHandle'];
  onClose(): void;
}

export const Handle = ({
  panGestureEnabled = true,
  handlePosition,
  handleStyle,
  withHandle,
  onClose,
}: HandleProps): JSX.Element | null => {
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
