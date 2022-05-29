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
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { height } from '../utils/dimensions';
import { isWeb } from '../utils/platform';

interface OverlayProps {
  tapGestureOverlayRef: RefObject<TapGestureHandler>;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: PanGestureHandlerStateChangeEvent): void;
}

export const Overlay = ({
  tapGestureOverlayRef,

  onGestureEvent,
  onHandlerStateChange,
}: OverlayProps) => {
  const {
    alwaysOpen,
    panGestureEnabled,
    withOverlay,
    closeOnOverlayTap,
    overlayStyle,
    onOverlayPress,
  } = useInternalProps();
  const { overlay, modalPosition, showContent, willCloseModalize, handleClose } =
    useInternalLogic();
  const ref = useRef<TapGestureHandler>(null);
  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const handleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.ACTIVE && !willCloseModalize.current) {
      onOverlayPress?.();
      handleClose(!!alwaysOpen ? 'alwaysOpen' : 'default');
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
