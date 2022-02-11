import React, {
  cloneElement,
  forwardRef,
  ReactNode,
  Ref,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  NativeEventSubscription,
  Platform,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  NativeGesture,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Element } from '../components/Element';
import { Close, Handles, ModalizeProps, Open, Position, Style } from '../options';
import s from '../styles';
import { clamp } from '../utils/clamp';
import { composeRefs } from '../utils/compose-refs';
import { isAndroid, isIos, isIphoneX } from '../utils/devices';
import { renderElement } from '../utils/render-element';
import { useDimensions } from '../utils/use-dimensions';

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<unknown>,
);

export const Child = (
  {
    // Refs
    contentRef,

    // Renderers
    children,
    scrollViewProps,
    flatListProps,
    sectionListProps,
    customRenderer,

    // Styles
    rootStyle,
    modalStyle,
    handleStyle,
    overlayStyle,
    childrenStyle,

    // Layout
    snapPoint,
    modalHeight,
    modalTopOffset = Platform.select({
      ios: 0,
      android: StatusBar.currentHeight || 0,
      default: 0,
    }),
    alwaysOpen,
    adjustToContentHeight = false,

    // Options
    handlePosition = 'outside',
    disableScrollIfPossible = true,
    avoidKeyboardLikeIOS = Platform.select({
      ios: true,
      android: false,
      default: true,
    }),
    keyboardAvoidingBehavior = 'padding',
    keyboardAvoidingOffset,
    panGestureEnabled = true,
    panGestureComponentEnabled = false,
    tapGestureEnabled = true,
    closeOnOverlayTap = true,
    closeSnapPointStraightEnabled = true,

    // Animations
    openAnimationConfig = {
      timing: { duration: 240, easing: Easing.ease },
      spring: {
        damping: 50,
        mass: 0.3,
        stiffness: 120,
      },
    },
    closeAnimationConfig = {
      timing: { duration: 240, easing: Easing.ease },
    },
    dragToss = 0.18,
    threshold = 120,
    velocity = 2800,
    panGestureAnimatedValue,

    // Elements visibilities
    withHandle = true,
    withOverlay = true,

    // Additional components
    HeaderComponent,
    FooterComponent,
    FloatingComponent,

    // Callbacks
    onOpen,
    onOpened,
    onClose,
    onClosed,
    onBackButtonPress,
    onPositionChange,
    onOverlayPress,
    onLayout,
  }: ModalizeProps,
  ref: Ref<ReactNode>,
): JSX.Element | null => {
  const { height: screenHeight } = useDimensions();
  const isHandleOutside = handlePosition === 'outside';
  const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
  const fullHeight = screenHeight - modalTopOffset;
  const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
  const endHeight = modalHeight || computedHeight;
  const adjustValue = adjustToContentHeight ? undefined : endHeight;
  const snaps = snapPoint ? [0, endHeight - snapPoint, endHeight] : [0, endHeight];

  const [modalHeightValue, setModalHeightValue] = useState(adjustValue);
  const [lastSnap, setLastSnap] = useState(snapPoint ? endHeight - snapPoint : 0);
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [enableBounces, setEnableBounces] = useState(true);
  const [keyboardToggle, setKeyboardToggle] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [disableScroll, setDisableScroll] = useState(alwaysOpen || snapPoint ? true : undefined);
  const [modalPosition, setModalPosition] = useState<Position>('initial');
  const [cancelClose, setCancelClose] = useState(false);
  const [layouts, setLayouts] = useState<Map<string, number>>(new Map());

  const cancelTranslateY = useSharedValue(1); // 1 by default to have the translateY animation running
  const componentTranslateY = useSharedValue(0);
  const overlay = useSharedValue(0);
  const beginScrollY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const translateY = useSharedValue(screenHeight);
  const reverseBeginScrollY = useSharedValue(-1 * beginScrollY.value);

  const tapGestureModalizeRef = useRef<TapGestureHandler | null>(null);
  const panGestureChildrenRef = useRef<PanGestureHandler | null>(null);
  const nativeGestureChildrenRef = useRef<NativeGesture>();
  const contentViewRef = useRef<(ScrollView | FlatList<any> | SectionList<any>) | null>(null);
  const tapGestureOverlayRef = useRef<TapGestureHandler | null>(null);
  const backButtonListenerRef = useRef<NativeEventSubscription | null>(null);

  const handleGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      dragY.value = translationY;

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
    },
  });

  // We diff and get the negative value only. It sometimes go above 0
  // (e.g. 1.5) and creates the flickering on Modalize for a ms
  const diffClamp = useDerivedValue(
    () => clamp(reverseBeginScrollY.value, -screenHeight, 0),
    [reverseBeginScrollY, screenHeight],
  );

  // We diff and get the negative value only. It sometimes go above 0
  // (e.g. 1.5) and creates the flickering on Modalize for a ms
  // const diffClamp = Animated.diffClamp(reverseBeginScrollY, -screenHeight, 0);
  const componentDragEnabled = componentTranslateY.value === 1;

  // When we have a scrolling happening in the ScrollView, we don't want to translate
  // the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
  const dragValue = useDerivedValue(
    () => dragY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + diffClamp.value,
    [dragY, componentDragEnabled, cancelTranslateY, diffClamp],
  );

  const computedTranslateY = useDerivedValue(
    () => translateY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + dragValue.value,
    [translateY, componentDragEnabled, cancelTranslateY, dragValue],
  );

  const childrenPanGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .simultaneousWithExternalGesture(nativeGestureChildrenRef, tapGestureModalizeRef)
    .shouldCancelWhenOutside(false)
    .activeOffsetX(ACTIVATED)
    .activeOffsetY(ACTIVATED)
    .onBegin(nativeEvent => {
      handleChildren({ nativeEvent }, 'children');
    })
    .onStart(({ translationY }) => {
      dragY.value = translationY;

      /*
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
    });

  const childrenNativeGesture = Gesture.Native()
    .withRef(nativeGestureChildrenRef)
    .simultaneousWithExternalGesture(panGestureChildrenRef);

  const overlayTapGesture = Gesture.Tap()
    .enabled(closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled)
    .onStart(() => {
      /*
      if (!willCloseModalize) {
        // onOverlayPress?.();
        // handleClose(!!alwaysOpen ? 'alwaysOpen' : 'default');
        runOnJS(handleClose)(!!alwaysOpen ? 'alwaysOpen' : 'default');
      }
      */
    });

  const panGesture = Gesture.Pan()
    .enabled(panGestureEnabled)
    .shouldCancelWhenOutside(false)
    .simultaneousWithExternalGesture(tapGestureModalizeRef)
    .onUpdate(({ translationY }) => {
      dragY.value = translationY;
    })
    .onEnd(() => {
      dragY.value = 0;
    });

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const animatedKeyboardAvoidingViewStyle = useAnimatedStyle(() => ({
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

  let willCloseModalize = false;

  const closeFinished = ({
    callback,
    dest,
    toInitialAlwaysOpen,
    toValue,
    lastSnapValue,
  }: {
    callback?: () => void;
    dest: Close;
    toInitialAlwaysOpen: boolean;
    toValue: number;
    lastSnapValue: number;
  }) => {
    onClosed?.();
    callback?.();

    if (alwaysOpen && dest === 'alwaysOpen' && onPositionChange) {
      onPositionChange('initial');
    }

    if (alwaysOpen && dest === 'alwaysOpen') {
      setModalPosition('initial');
    }

    setShowContent(toInitialAlwaysOpen);
    translateY.value = toValue;
    dragY.value = 0;
    willCloseModalize = false;
    setLastSnap(lastSnapValue);
    setIsVisible(toInitialAlwaysOpen);
  };

  const handleAnimateClose = (dest: Close = 'default', callback?: () => void): void => {
    const { timing, spring } = closeAnimationConfig;
    const lastSnapValue = snapPoint ? snaps[1] : 80;
    const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
    const toValue =
      toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;

    backButtonListenerRef.current?.remove();
    cancelTranslateY.value = 1;
    beginScrollY.value = 0;

    overlay.value = withTiming(0, {
      duration: timing.duration,
      easing: Easing.ease,
    });

    if (panGestureAnimatedValue) {
      panGestureAnimatedValue.value = withTiming(0, {
        duration: PAN_DURATION,
        easing: Easing.ease,
      });
    }

    if (spring) {
      translateY.value = withSpring(toValue, spring, isFinished => {
        if (isFinished) {
          runOnJS(closeFinished)({
            callback,
            dest,
            toInitialAlwaysOpen,
            toValue,
            lastSnapValue,
          });
        }
      });
    } else {
      translateY.value = withTiming(
        toValue,
        {
          duration: timing.duration,
          easing: Easing.ease,
        },
        isFinished => {
          if (isFinished) {
            runOnJS(closeFinished)({
              callback,
              dest,
              toInitialAlwaysOpen,
              toValue,
              lastSnapValue,
            });
          }
        },
      );
    }
  };

  const handleBaseLayout = (
    component: 'content' | 'header' | 'footer' | 'floating',
    height: number,
  ): void => {
    setLayouts(new Map(layouts.set(component, height)));

    const max = Array.from(layouts).reduce((acc, cur) => acc + cur?.[1], 0);
    const maxFixed = +max.toFixed(3);
    const endHeightFixed = +endHeight.toFixed(3);
    const shorterHeight = maxFixed < endHeightFixed;

    setDisableScroll(shorterHeight && disableScrollIfPossible);
  };

  const handleContentLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
    if (onLayout) {
      onLayout(nativeEvent);
    }

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

  const handleClose = (dest?: Close, callback?: () => void): void => {
    if (onClose) {
      onClose();
    }

    handleAnimateClose(dest, callback);
  };

  const handleChildren = (
    { nativeEvent }: PanGestureHandlerStateChangeEvent,
    type?: 'component' | 'children',
  ): void => {
    const { timing } = closeAnimationConfig;
    const { velocityY, translationY } = nativeEvent;
    const negativeReverseScroll =
      modalPosition === 'top' &&
      beginScrollY.value >= (snapPoint ? 0 : SCROLL_THRESHOLD) &&
      translationY < 0;
    const thresholdProps = translationY > threshold && beginScrollY.value === 0;
    const closeThreshold = velocity
      ? (beginScrollY.value <= 20 && velocityY >= velocity) || thresholdProps
      : thresholdProps;
    let enableBouncesValue = true;

    // We make sure to reset the value if we are dragging from the children
    if (type !== 'component' && cancelTranslateY.value === 0) {
      componentTranslateY.value = 0;
    }

    /*
     * When the pan gesture began we check the position of the ScrollView "cursor".
     * We cancel the translation animation if the ScrollView is not scrolled to the top
     */
    if (nativeEvent.oldState === State.BEGAN) {
      setCancelClose(false);

      if (
        !closeSnapPointStraightEnabled && snapPoint
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
            (Boolean(snapPoint) || Boolean(alwaysOpen)) && modalPosition === 'initial',
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
      let destSnapPoint = 0;

      if (snapPoint || alwaysOpen) {
        const endOffsetY = lastSnap + toValue + dragToss * velocityY;

        /**
         * snapPoint and alwaysOpen use both an array of points to define the first open state and the final state.
         */
        snaps.forEach((snap: number) => {
          const distFromSnap = Math.abs(snap - endOffsetY);
          const diffPoint = Math.abs(destSnapPoint - endOffsetY);

          // For snapPoint
          if (distFromSnap < diffPoint && !alwaysOpen) {
            if (closeSnapPointStraightEnabled) {
              if (modalPosition === 'initial' && negativeReverseScroll) {
                destSnapPoint = snap;
                willCloseModalize = false;
              }

              if (snap === endHeight) {
                destSnapPoint = snap;
                willCloseModalize = true;
                handleClose();
              }
            } else {
              destSnapPoint = snap;
              willCloseModalize = false;

              if (snap === endHeight) {
                willCloseModalize = true;
                handleClose();
              }
            }
          }

          // For alwaysOpen props
          if (distFromSnap < diffPoint && alwaysOpen && beginScrollY.value <= 0) {
            destSnapPoint = (modalHeightValue || 0) - alwaysOpen;
            willCloseModalize = false;
          }
        });
      } else if (closeThreshold && !alwaysOpen && !cancelClose) {
        willCloseModalize = true;
        handleClose();
      }

      if (willCloseModalize) {
        return;
      }

      setLastSnap(destSnapPoint);
      translateY.value = toValue;
      dragY.value = 0;

      if (alwaysOpen) {
        overlay.value = withTiming(Number(destSnapPoint <= 0), {
          duration: timing.duration,
          easing: Easing.ease,
        });
      }

      translateY.value = withSpring(destSnapPoint, {
        velocity: velocityY,
      });

      if (beginScrollY.value <= 0) {
        const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

        if (panGestureAnimatedValue) {
          panGestureAnimatedValue.value = withTiming(Number(modalPositionValue === 'top'), {
            duration: PAN_DURATION,
            easing: Easing.ease,
          });
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

  const useContentScroll = useAnimatedScrollHandler({
    onBeginDrag: ({ contentOffset: { y } }) => {
      beginScrollY.value = y;
    },
  });

  const keyboardDismissMode: Animated.Value<number> | 'interactive' | 'on-drag' = isIos
    ? 'interactive'
    : 'on-drag';
  const passedOnProps = flatListProps ?? sectionListProps ?? scrollViewProps;
  // We allow overwrites when the props (bounces, scrollEnabled) are set to false, when true we use Modalize's core behavior
  const bounces =
    passedOnProps?.bounces !== undefined && !passedOnProps?.bounces
      ? passedOnProps?.bounces
      : enableBounces;
  const scrollEnabled =
    passedOnProps?.scrollEnabled !== undefined && !passedOnProps?.scrollEnabled
      ? passedOnProps?.scrollEnabled
      : keyboardToggle || !disableScroll;
  const scrollEventThrottle = passedOnProps?.scrollEventThrottle || 16;

  const opts = {
    ref: composeRefs(contentViewRef, contentRef) as RefObject<any>,
    bounces,
    onscroll: useContentScroll,
    scrollEventThrottle,
    onLayout: handleContentLayout,
    scrollEnabled,
    keyboardDismissMode,
  };

  const style = adjustToContentHeight ? s.content__adjustHeight : s.content__container;

  return (
    <GestureDetector gesture={childrenPanGesture}>
      <Animated.View style={[style, childrenStyle]}>
        <GestureDetector
          // ref={nativeGestureChildrenRef}
          // waitFor={tapGestureModalizeRef}
          // simultaneousHandlers={panGestureChildrenRef}
          gesture={childrenNativeGesture}
        >
          {flatListProps ? (
            <Animated.FlatList {...flatListProps} {...opts} />
          ) : sectionListProps ? (
            <AnimatedSectionList {...sectionListProps} {...opts} />
          ) : customRenderer ? (
            cloneElement(renderElement(customRenderer), { ...opts })
          ) : (
            <Animated.ScrollView {...scrollViewProps} {...opts}>
              {children}
            </Animated.ScrollView>
          )}
        </GestureDetector>
      </Animated.View>
    </GestureDetector>
  );
};
