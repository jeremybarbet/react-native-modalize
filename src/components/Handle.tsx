import React, { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { Props, Style } from '../options';

interface HandleProps {
  panGestureEnabled: Props['panGestureEnabled'];
  withHandle: Props['withHandle'];
  handleStyle: Props['handleStyle'];
  tapGestureModalizeRef: RefObject<TapGestureHandler>;
  isHandleOutside: boolean;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: PanGestureHandlerStateChangeEvent): void;
}

export const Handle = ({
  panGestureEnabled,
  withHandle,
  handleStyle,
  tapGestureModalizeRef,
  isHandleOutside,
  onGestureEvent,
  onHandlerStateChange,
}: HandleProps) => {
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
    <PanGestureHandler
      enabled={panGestureEnabled}
      simultaneousHandlers={tapGestureModalizeRef}
      shouldCancelWhenOutside={false}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={handleStyles}>
        <View style={shapeStyles} />
      </Animated.View>
    </PanGestureHandler>
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
