import React, { Ref, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import {
  GestureEvent,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { Close, Position, Props } from '../options';
import { height } from '../utils/dimensions';
import { isWeb } from '../utils/platform';

interface OverlayProps {
  alwaysOpen: Props['alwaysOpen'];
  panGestureEnabled: Props['panGestureEnabled'];
  withOverlay: Props['withOverlay'];
  closeOnOverlayTap: Props['closeOnOverlayTap'];
  overlayStyle: Props['overlayStyle'];
  onOverlayPress: Props['onOverlayPress'];
  modalPosition: Position;
  simultaneousHandlers: Ref<unknown>;
  showContent: boolean;
  willCloseModalize: boolean;
  overlay: Animated.Value;
  onGestureEvent(event: GestureEvent<PanGestureHandlerEventPayload>): void;
  onHandlerStateChange(event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>): void;
  onClose(dest?: Close, callback?: () => void): void;
}

export const Overlay = ({
  alwaysOpen,
  panGestureEnabled,
  withOverlay,
  closeOnOverlayTap,
  overlayStyle,
  onOverlayPress,
  modalPosition,
  simultaneousHandlers,
  showContent,
  willCloseModalize,
  overlay,
  onGestureEvent,
  onHandlerStateChange,
  onClose,
}: OverlayProps) => {
  const ref = useRef<TapGestureHandler>(null);
  const pointerEvents =
    alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

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
      simultaneousHandlers={simultaneousHandlers}
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
              style={[
                s.overlay__background,
                overlayStyle,
                {
                  opacity: overlay.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
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
