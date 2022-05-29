import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  EmitterSubscription,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { Close, Handles, Open, Props } from '../options';
import { constants } from '../utils/constants';
import { invariant } from '../utils/invariant';
import { isBelowRN65 } from '../utils/libraries';
import { isAndroid } from '../utils/platform';

import { Child } from './Child';
import { Element, ElementType } from './Element';
import { Handle } from './Handle';
import { Overlay } from './Overlay';

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);

export const Modalize = forwardRef<Handles, Props>(({ children }, ref) => {
  const { height: screenHeight } = useWindowDimensions();

  const {
    scrollViewProps,
    flatListProps,
    sectionListProps,
    rootStyle,
    modalStyle,
    snapPoints,
    modalHeight,
    alwaysOpen,
    adjustToContentHeight,
    disableScrollIfPossible,
    avoidKeyboardLikeIOS,
    keyboardAvoidingBehavior,
    keyboardAvoidingOffset,
    panGestureEnabled,
    tapGestureEnabled,
    closeSnapPointsStraightEnabled,
    panGestureAnimatedValue,
    withOverlay,
    HeaderComponent,
    FooterComponent,
    FloatingComponent,
    onOpen,
    onPositionChange,
    onLayout,
  } = useInternalProps();

  const {
    // Animations
    cancelTranslateY,
    componentTranslateY,
    overlay,
    beginScrollY,
    dragY,
    translateY,
    computedTranslateY,

    // Variables
    isHandleOutside,
    endHeight,
    adjustValue,
    snaps,

    // States
    modalHeightValue,
    setModalHeightValue,
    lastSnap,
    setLastSnap,
    isVisible,
    showContent,
    setEnableBounces,
    setKeyboardToggle,
    keyboardHeight,
    setKeyboardHeight,
    setDisableScroll,
    modalPosition,
    setModalPosition,
    cancelClose,
    setCancelClose,
    layouts,
    setLayouts,
    willCloseModalize,

    // Methods
    handleAnimateOpen,
    handleClose,
  } = useInternalLogic();

  const tapGestureModalizeRef = useRef<TapGestureHandler | null>(null);
  const panGestureChildrenRef = useRef<PanGestureHandler | null>(null);
  const nativeViewChildrenRef = useRef<NativeViewGestureHandler | null>(null);
  const tapGestureOverlayRef = useRef<TapGestureHandler | null>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    height: modalHeightValue,
    maxHeight: endHeight,
    transform: [
      {
        translateY: interpolate(
          computedTranslateY.value,
          [-40, 0, endHeight],
          [0, 0, endHeight],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const handleKeyboardShow = (event: KeyboardEvent) => {
    const { height } = event.endCoordinates;

    setKeyboardToggle(true);
    setKeyboardHeight(height);
  };

  const handleKeyboardHide = () => {
    setKeyboardToggle(false);
    setKeyboardHeight(0);
  };

  const handleModalizeContentLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    const value = Math.min(
      layout.height + (!adjustToContentHeight || keyboardHeight ? layout.y : 0),
      endHeight -
        Platform.select({
          ios: 0,
          android: keyboardHeight,
          default: 0,
        }),
    );

    setModalHeightValue(value);
  };

  const handleBaseLayout = (component: 'content' | ElementType, height: number) => {
    setLayouts(new Map(layouts.set(component, height)));

    const max = Array.from(layouts).reduce((acc, cur) => acc + cur?.[1], 0);
    const maxFixed = +max.toFixed(3);
    const endHeightFixed = +endHeight.toFixed(3);
    const shorterHeight = maxFixed < endHeightFixed;

    setDisableScroll(shorterHeight && disableScrollIfPossible);
  };

  const handleContentLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    onLayout?.(nativeEvent);

    if (alwaysOpen && adjustToContentHeight) {
      const { height } = nativeEvent.layout;

      return setModalHeightValue(height);
    }

    // We don't want to disable the scroll if we are not using adjustToContentHeight props
    if (!adjustToContentHeight) {
      return;
    }

    handleBaseLayout('content', nativeEvent.layout.height);
  };

  const handleComponentLayout = (
    { nativeEvent }: LayoutChangeEvent,
    id: ElementType,
    absolute: boolean,
  ) => {
    /**
     * We don't want to disable the scroll if we are not using adjustToContentHeight props.
     * Also, if the component is in absolute positioning we don't want to take in
     * account its dimensions, so we just skip.
     */
    if (!adjustToContentHeight || absolute) {
      return;
    }

    handleBaseLayout(id, nativeEvent.layout.height);
  };

  // const handleClose = (dest?: Close, callback?: () => void) => {
  //   onClose?.();
  //   handleAnimateClose(dest, callback);
  // };

  const handleChildren = (
    { nativeEvent }: PanGestureHandlerStateChangeEvent,
    type?: 'component' | 'children',
  ) => {
    const { velocityY, translationY } = nativeEvent;
    const negativeReverseScroll =
      modalPosition === 'top' &&
      beginScrollY.value >= (snapPoints ? 0 : constants.scrollThreshold) &&
      translationY < 0;
    const thresholdProps =
      translationY > constants.animations.threshold && beginScrollY.value === 0;
    const closeThreshold = constants.animations.velocity
      ? (beginScrollY.value <= 20 && velocityY >= constants.animations.velocity) || thresholdProps
      : thresholdProps;
    let enableBouncesValue = true;

    // We make sure to reset the value if we are dragging from the children
    if (type !== 'component' && (cancelTranslateY as any)._value === 0) {
      componentTranslateY.value = 0;
    }

    /*
     * When the pan gesture began we check the position of the ScrollView "cursor".
     * We cancel the translation animation if the ScrollView is not scrolled to the top
     */
    if (nativeEvent.oldState === State.BEGAN) {
      setCancelClose(false);

      if (
        !closeSnapPointsStraightEnabled && snapPoints
          ? beginScrollY.value > 0
          : beginScrollY.value > 0 || negativeReverseScroll
      ) {
        setCancelClose(true);
        translateY.value = 0;
        dragY.value = 0;
        cancelTranslateY.value = 0;
        enableBouncesValue = true;
      } else {
        cancelTranslateY.value = 1;
        enableBouncesValue = false;

        if (!tapGestureEnabled) {
          setDisableScroll(
            (Boolean(snapPoints) || Boolean(alwaysOpen)) && modalPosition === 'initial',
          );
        }
      }
    }

    setEnableBounces(
      isAndroid
        ? false
        : alwaysOpen
        ? beginScrollY.value > 0 || translationY < 0
        : enableBouncesValue,
    );

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - beginScrollY.value;
      let destSnapPoints = 0;

      if (snapPoints || alwaysOpen) {
        const endOffsetY = lastSnap + toValue + constants.animations.dragToss * velocityY;

        /**
         * snapPoints and alwaysOpen use both an array of points to define the first open state and the final state.
         */
        snaps.forEach((snap: number) => {
          const distFromSnap = Math.abs(snap - endOffsetY);
          const diffPoint = Math.abs(destSnapPoints - endOffsetY);

          // For snapPoints
          if (distFromSnap < diffPoint && !alwaysOpen) {
            if (closeSnapPointsStraightEnabled) {
              if (modalPosition === 'initial' && negativeReverseScroll) {
                destSnapPoints = snap;
                willCloseModalize.current = false;
              }

              if (snap === endHeight) {
                destSnapPoints = snap;
                willCloseModalize.current = true;
                handleClose();
              }
            } else {
              destSnapPoints = snap;
              willCloseModalize.current = false;

              if (snap === endHeight) {
                willCloseModalize.current = true;
                handleClose();
              }
            }
          }

          // For alwaysOpen props
          if (distFromSnap < diffPoint && alwaysOpen && beginScrollY.value <= 0) {
            destSnapPoints = (modalHeightValue || 0) - alwaysOpen;
            willCloseModalize.current = false;
          }
        });
      } else if (closeThreshold && !alwaysOpen && !cancelClose) {
        willCloseModalize.current = true;
        handleClose();
      }

      if (willCloseModalize.current) {
        return;
      }

      setLastSnap(destSnapPoints);
      translateY.value = toValue;
      dragY.value = 0;

      if (alwaysOpen) {
        overlay.value = withSpring(Number(destSnapPoints <= 0), constants.springConfig);
      }

      translateY.value = withSpring(destSnapPoints, constants.springConfig);

      if (beginScrollY.value <= 0) {
        const modalPositionValue = destSnapPoints <= 0 ? 'top' : 'initial';

        if (panGestureAnimatedValue) {
          panGestureAnimatedValue.value = Number(modalPositionValue === 'top');
        }

        if (!adjustToContentHeight && modalPositionValue === 'top') {
          setDisableScroll(false);
        }

        if (onPositionChange && modalPosition !== modalPositionValue) {
          onPositionChange(modalPositionValue);
        }

        if (modalPosition !== modalPositionValue) {
          setModalPosition(modalPositionValue);
        }
      }
    }
  };

  const handleElement = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    // If we drag from the HeaderComponent/FooterComponent/FloatingComponent we allow the translation animation
    if (nativeEvent.oldState === State.BEGAN) {
      componentTranslateY.value = 1;
      beginScrollY.value = 0;
    }

    handleChildren({ nativeEvent }, 'component');
  };

  const handleGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      dragY.value = translationY;

      if (panGestureAnimatedValue) {
        const offset = alwaysOpen ?? snapPoints?.[0] ?? 0;
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
    },
  });

  useImperativeHandle(ref, () => ({
    open(dest?: Open) {
      onOpen?.();
      handleAnimateOpen(alwaysOpen, dest);
    },

    close(dest?: Close, callback?: () => void) {
      handleClose(dest, callback);
    },
  }));

  useEffect(() => {
    if (alwaysOpen && (modalHeightValue || adjustToContentHeight)) {
      handleAnimateOpen(alwaysOpen);
    }
  }, [alwaysOpen, modalHeightValue]);

  useEffect(() => {
    invariant(
      modalHeight && adjustToContentHeight,
      `You can't use both 'modalHeight' and 'adjustToContentHeight' props at the same time. Only choose one of the two.`,
    );
    invariant(
      (scrollViewProps || children) && flatListProps,
      `You have defined 'flatListProps' along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'flatListProps' to fix the error.`,
    );
    invariant(
      (scrollViewProps || children) && sectionListProps,
      `You have defined 'sectionListProps'  along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'sectionListProps' to fix the error.`,
    );
  }, [
    modalHeight,
    adjustToContentHeight,
    scrollViewProps,
    children,
    flatListProps,
    sectionListProps,
  ]);

  useEffect(() => {
    setModalHeightValue(adjustValue);
  }, [adjustToContentHeight, modalHeight, screenHeight]);

  useEffect(() => {
    let keyboardShowListener: EmitterSubscription | null = null;
    let keyboardHideListener: EmitterSubscription | null = null;

    if (isBelowRN65) {
      Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
      Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    } else {
      keyboardShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
      keyboardHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    }

    return () => {
      if (isBelowRN65) {
        Keyboard.removeListener('keyboardDidShow', handleKeyboardShow);
        Keyboard.removeListener('keyboardDidHide', handleKeyboardHide);
      } else {
        keyboardShowListener?.remove();
        keyboardHideListener?.remove();
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={[s.modalize, rootStyle]}
      pointerEvents={alwaysOpen || !withOverlay ? 'box-none' : 'auto'}
    >
      <TapGestureHandler
        ref={tapGestureModalizeRef}
        maxDurationMs={tapGestureEnabled ? 100000 : 50}
        maxDeltaY={lastSnap}
        enabled={panGestureEnabled}
      >
        <View style={s.modalize__wrapper} pointerEvents="box-none">
          {showContent && (
            <AnimatedKeyboardAvoidingView
              keyboardVerticalOffset={keyboardAvoidingOffset}
              behavior={keyboardAvoidingBehavior}
              enabled={avoidKeyboardLikeIOS}
              style={[s.modalize__content, modalStyle, animatedStyle]}
              onLayout={
                !avoidKeyboardLikeIOS && !adjustToContentHeight
                  ? handleModalizeContentLayout
                  : undefined
              }
            >
              <Handle
                tapGestureModalizeRef={tapGestureModalizeRef}
                isHandleOutside={isHandleOutside}
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleChildren}
              />

              <Element
                id={ElementType.header}
                component={HeaderComponent}
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleElement}
                onComponentLayout={handleComponentLayout}
              />

              <Child
                nativeViewChildrenRef={nativeViewChildrenRef}
                tapGestureModalizeRef={tapGestureModalizeRef}
                panGestureChildrenRef={panGestureChildrenRef}
                onLayout={handleContentLayout}
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleChildren}
              >
                {children}
              </Child>

              <Element
                id={ElementType.footer}
                component={FooterComponent}
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleElement}
                onComponentLayout={handleComponentLayout}
              />
            </AnimatedKeyboardAvoidingView>
          )}

          <Overlay
            tapGestureOverlayRef={tapGestureOverlayRef}
            onGestureEvent={handleGestureEvent}
            onHandlerStateChange={handleChildren}
          />
        </View>
      </TapGestureHandler>

      <Element
        id={ElementType.floating}
        component={FloatingComponent}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleElement}
        onComponentLayout={handleComponentLayout}
      />
    </GestureHandlerRootView>
  );
});

const s = StyleSheet.create({
  modalize: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9998,
  },

  modalize__wrapper: {
    flex: 1,
  },

  modalize__content: {
    zIndex: 5,

    marginTop: 'auto',

    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,

    elevation: 4,
  },
});
