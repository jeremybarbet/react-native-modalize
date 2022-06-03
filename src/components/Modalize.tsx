import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { Callback, Close, Handles, Open, Props } from '../options';
import { invariant } from '../utils/invariant';

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
    modalHeight,
    alwaysOpen,
    adjustToContentHeight,
    disableScrollIfPossible,
    avoidKeyboardLikeIOS,
    keyboardAvoidingBehavior,
    keyboardAvoidingOffset,
    panGestureEnabled,
    withOverlay,
    HeaderComponent,
    FooterComponent,
    FloatingComponent,
    onLayout,
  } = useInternalProps();

  const {
    // Animations
    derivedTranslateY,

    // Variables
    endHeight,
    adjustValue,

    // States
    modalHeightValue,
    setModalHeightValue,
    isVisible,
    showContent,
    setKeyboardToggle,
    keyboardHeight,
    setKeyboardHeight,
    setDisableScroll,
    layouts,
    setLayouts,
    lastSnap,

    // Methods
    handleOpen,
    handleClose,
  } = useInternalLogic();

  const tapGestureRef = useRef<TapGestureHandler>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    height: modalHeightValue,
    maxHeight: endHeight,
    transform: [
      {
        translateY: interpolate(
          derivedTranslateY.value,
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

  const handleRendererLayout = ({ nativeEvent }: LayoutChangeEvent) => {
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

  useImperativeHandle(ref, () => ({
    open(dest?: Open) {
      handleOpen(alwaysOpen, dest);
    },

    close(dest: Close = 'default', callback?: Callback) {
      handleClose(dest, callback);
    },
  }));

  useEffect(() => {
    if (alwaysOpen && (modalHeightValue || adjustToContentHeight)) {
      handleOpen(alwaysOpen);
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
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      keyboardShowListener?.remove();
      keyboardHideListener?.remove();
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
        ref={tapGestureRef}
        maxDurationMs={100000}
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
              <Handle />

              <Element
                id={ElementType.header}
                component={HeaderComponent}
                onComponentLayout={handleComponentLayout}
              />

              <Child tapGestureRef={tapGestureRef} onLayout={handleRendererLayout}>
                {children}
              </Child>

              <Element
                id={ElementType.footer}
                component={FooterComponent}
                onComponentLayout={handleComponentLayout}
              />
            </AnimatedKeyboardAvoidingView>
          )}

          <Overlay />
        </View>
      </TapGestureHandler>

      <Element
        id={ElementType.floating}
        component={FloatingComponent}
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
