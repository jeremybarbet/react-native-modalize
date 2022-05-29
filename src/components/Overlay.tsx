import React, { RefObject, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useInternalProps } from '../contexts/internalPropsProvider';
import { Close, Position } from '../options';
import { height } from '../utils/dimensions';
import { isWeb } from '../utils/platform';

interface OverlayProps {
  modalPosition: Position;
  tapGestureOverlayRef: RefObject<TapGestureHandler>;
  showContent: boolean;
  willCloseModalize: boolean;
  overlay: SharedValue<number>;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: PanGestureHandlerStateChangeEvent): void;
  onClose(dest?: Close, callback?: () => void): void;
}

export const Overlay = ({
  modalPosition,
  tapGestureOverlayRef,
  showContent,
  willCloseModalize,
  overlay,
  onGestureEvent,
  onHandlerStateChange,
  onClose,
}: OverlayProps) => {
  const {
    alwaysOpen,
    panGestureEnabled,
    withOverlay,
    closeOnOverlayTap,
    overlayStyle,
    onOverlayPress,
  } = useInternalProps();
  const ref = useRef<TapGestureHandler>(null);
  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const handleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.ACTIVE && !willCloseModalize) {
      onOverlayPress?.();
      onClose(!!alwaysOpen ? 'alwaysOpen' : 'default');
    }
  };

  if (!withOverlay) {
    return null;
  }

  return (
    <PanGestureHandler
      enabled={panGestureEnabled}
      simultaneousHandlers={tapGestureOverlayRef}
      shouldCancelWhenOutside={false}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
        {showContent && (
          <TapGestureHandler
            ref={ref}
            enabled={closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled}
            onHandlerStateChange={handleOverlay}
          >
            <Animated.View
              style={[s.overlay__background, overlayStyle, animatedStyle]}
              pointerEvents={pointerEvents}
            />
          </TapGestureHandler>
        )}
      </Animated.View>
    </PanGestureHandler>
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
