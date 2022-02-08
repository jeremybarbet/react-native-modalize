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
  Easing,
  EmitterSubscription,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  Modal,
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
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Animated, {
  Easing as RNREasing,
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

import { clamp } from './utils/clamp';
import { composeRefs } from './utils/compose-refs';
import { isAndroid, isIos, isIphoneX } from './utils/devices';
import { invariant } from './utils/invariant';
import { useDimensions } from './utils/use-dimensions';
import { Close, Handles, ModalizeProps, Open, Position, Style } from './options';
import s from './styles';

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
/**
 * When scrolling, it happens than beginScrollYValue is not always equal to 0 (top of the ScrollView).
 * Since we use this to trigger the swipe down gesture animation, we allow a small threshold to
 * not dismiss Modalize when we are using the ScrollView and we don't want to dismiss.
 */
const SCROLL_THRESHOLD = -4;
const USE_NATIVE_DRIVER = true;
const ACTIVATED = 20;
const PAN_DURATION = 150;

const ModalizeBase = (
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
  const nativeViewChildrenRef = useRef<NativeViewGestureHandler | null>(null);
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
  const diffClamp = useDerivedValue(() => clamp(reverseBeginScrollY.value, -screenHeight, 0), [
    reverseBeginScrollY,
    screenHeight,
  ]);

  // We diff and get the negative value only. It sometimes go above 0
  // (e.g. 1.5) and creates the flickering on Modalize for a ms
  // const diffClamp = Animated.diffClamp(reverseBeginScrollY, -screenHeight, 0);
  const componentDragEnabled = componentTranslateY.value === 1;

  // When we have a scrolling happening in the ScrollView, we don't want to translate
  // the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
  const dragValue = useDerivedValue(
    () => dragY.value * (componentDragEnabled ? 1 : cancelTranslateY.value),
    [dragY, componentDragEnabled, cancelTranslateY, diffClamp],
  );

  const computedTranslateY = useDerivedValue(
    () => translateY.value * (componentDragEnabled ? 1 : cancelTranslateY.value),
    [translateY, componentDragEnabled, cancelTranslateY, dragValue],
  );

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

  const handleBackPress = (): boolean => {
    if (alwaysOpen) {
      return false;
    }

    if (onBackButtonPress) {
      return onBackButtonPress();
    } else {
      handleClose();
    }

    return true;
  };

  const handleKeyboardShow = (event: KeyboardEvent): void => {
    const { height } = event.endCoordinates;

    setKeyboardToggle(true);
    setKeyboardHeight(height);
  };

  const handleKeyboardHide = (): void => {
    setKeyboardToggle(false);
    setKeyboardHeight(0);
  };

  const openFinished = (newPosition: Position) => {
    onOpened?.();
    // setModalPosition(newPosition);
    onPositionChange?.(newPosition);
  };

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

  const handleAnimateOpen = (alwaysOpenValue: number | undefined, dest: Open = 'default'): void => {
    const { timing, spring } = openAnimationConfig;

    backButtonListenerRef.current = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    let toValue = 0;
    let toPanValue = 0;
    let newPosition: Position;

    if (dest === 'top') {
      toValue = 0;
    } else if (alwaysOpenValue) {
      toValue = (modalHeightValue || 0) - alwaysOpenValue;
    } else if (snapPoint) {
      toValue = (modalHeightValue || 0) - snapPoint;
    }

    if (panGestureAnimatedValue && (alwaysOpenValue || snapPoint)) {
      toPanValue = 0;
    } else if (
      panGestureAnimatedValue &&
      !alwaysOpenValue &&
      (dest === 'top' || dest === 'default')
    ) {
      toPanValue = 1;
    }

    setIsVisible(true);
    setShowContent(true);

    if ((alwaysOpenValue && dest !== 'top') || (snapPoint && dest === 'default')) {
      newPosition = 'initial';
    } else {
      newPosition = 'top';
    }

    overlay.value = withTiming(alwaysOpenValue && dest === 'default' ? 0 : 1, {
      duration: timing.duration,
      easing: RNREasing.ease,
    });

    if (panGestureAnimatedValue) {
      panGestureAnimatedValue.value = withTiming(toPanValue, {
        duration: PAN_DURATION,
        easing: RNREasing.ease,
      });
    }

    if (spring) {
      translateY.value = withSpring(toValue, spring, isFinished => {
        if (isFinished) {
          runOnJS(openFinished)(newPosition);
        }
      });
    } else {
      translateY.value = withTiming(
        toValue,
        {
          duration: timing.duration,
          easing: RNREasing.ease,
        },
        isFinished => {
          if (isFinished) {
            runOnJS(openFinished)(newPosition);
          }
        },
      );
    }
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
      easing: RNREasing.ease,
    });

    if (panGestureAnimatedValue) {
      panGestureAnimatedValue.value = withTiming(0, {
        duration: PAN_DURATION,
        easing: RNREasing.ease,
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
          easing: RNREasing.ease,
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

  const handleModalizeContentLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent): void => {
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

  const handleComponentLayout = (
    { nativeEvent }: LayoutChangeEvent,
    name: 'header' | 'footer' | 'floating',
    absolute: boolean,
  ): void => {
    /**
     * We don't want to disable the scroll if we are not using adjustToContentHeight props.
     * Also, if the component is in absolute positioning we don't want to take in
     * account its dimensions, so we just skip.
     */
    if (!adjustToContentHeight || absolute) {
      return;
    }

    handleBaseLayout(name, nativeEvent.layout.height);
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
          easing: RNREasing.ease,
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
            easing: RNREasing.ease,
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

  const handleComponent = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    // If we drag from the HeaderComponent/FooterComponent/FloatingComponent we allow the translation animation
    if (nativeEvent.oldState === State.BEGAN) {
      componentTranslateY.value = 1;
      beginScrollY.value = 0;
    }

    handleChildren({ nativeEvent }, 'component');
  };

  const handleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.ACTIVE && !willCloseModalize) {
      if (onOverlayPress) {
        onOverlayPress();
      }

      const dest = !!alwaysOpen ? 'alwaysOpen' : 'default';

      handleClose(dest);
    }
  };

  /*
  const handleGestureEvent = Animated.event([{ nativeEvent: { translationY: dragY } }], {
    useNativeDriver: USE_NATIVE_DRIVER,
    listener: ({ nativeEvent: { translationY } }: PanGestureHandlerStateChangeEvent) => {
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

        panGestureAnimatedValue.setValue(value);
      }
    },
  });
  */

  const renderHandle = (): JSX.Element | null => {
    const handleStyles: (Style | undefined)[] = [s.handle];
    const shapeStyles: (Style | undefined)[] = [s.handle__shape, handleStyle];

    if (!withHandle) {
      return null;
    }

    if (!isHandleOutside) {
      handleStyles.push(s.handleBottom);
      shapeStyles.push(s.handle__shapeBottom, handleStyle);
    }

    return (
      <PanGestureHandler
        enabled={panGestureEnabled}
        simultaneousHandlers={tapGestureModalizeRef}
        shouldCancelWhenOutside={false}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleComponent}
      >
        <Animated.View style={handleStyles}>
          <View style={shapeStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderElement = (Element: ReactNode): JSX.Element =>
    typeof Element === 'function' ? Element() : Element;

  const renderComponent = (
    component: ReactNode,
    name: 'header' | 'footer' | 'floating',
  ): JSX.Element | null => {
    if (!component) {
      return null;
    }

    const tag = renderElement(component);

    /**
     * Nesting Touchable/ScrollView components with RNGH PanGestureHandler cancels the inner events.
     * Until a better solution lands in RNGH, I will disable the PanGestureHandler for Android only,
     * so inner touchable/gestures are working from the custom components you can pass in.
     */
    if (isAndroid && !panGestureComponentEnabled) {
      return tag;
    }

    const obj: ViewStyle = StyleSheet.flatten(tag?.props?.style);
    const absolute: boolean = obj?.position === 'absolute';
    const zIndex: number | undefined = obj?.zIndex;

    return (
      <PanGestureHandler
        enabled={panGestureEnabled}
        shouldCancelWhenOutside={false}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleComponent}
      >
        <Animated.View
          style={{ zIndex }}
          onLayout={(e: LayoutChangeEvent): void => handleComponentLayout(e, name, absolute)}
        >
          {tag}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const useContentScroll = useAnimatedScrollHandler({
    onBeginDrag: ({ contentOffset: { y } }) => {
      beginScrollY.value = y;
    },
  });

  const renderContent = (): JSX.Element => {
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

    if (flatListProps) {
      return <Animated.FlatList {...flatListProps} {...opts} />;
    }

    if (sectionListProps) {
      return <Animated.SectionList {...sectionListProps} {...opts} />;
    }

    if (customRenderer) {
      const tag = renderElement(customRenderer);

      return cloneElement(tag, { ...opts });
    }

    return (
      <Animated.ScrollView {...scrollViewProps} {...opts}>
        {children}
      </Animated.ScrollView>
    );
  };

  const renderChildren = (): JSX.Element => {
    const style = adjustToContentHeight ? s.content__adjustHeight : s.content__container;

    return (
      <PanGestureHandler
        ref={panGestureChildrenRef}
        enabled={panGestureEnabled}
        simultaneousHandlers={[nativeViewChildrenRef, tapGestureModalizeRef]}
        shouldCancelWhenOutside={false}
        onGestureEvent={handleGestureEvent}
        // minDist={minDist}
        activeOffsetY={ACTIVATED}
        activeOffsetX={ACTIVATED}
        onHandlerStateChange={handleChildren}
      >
        <Animated.View style={[style, childrenStyle]}>
          <NativeViewGestureHandler
            ref={nativeViewChildrenRef}
            waitFor={tapGestureModalizeRef}
            simultaneousHandlers={panGestureChildrenRef}
          >
            {renderContent()}
          </NativeViewGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderOverlay = (): JSX.Element => {
    const pointerEvents =
      alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';

    return (
      <PanGestureHandler
        enabled={panGestureEnabled}
        simultaneousHandlers={tapGestureModalizeRef}
        shouldCancelWhenOutside={false}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleChildren}
      >
        <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
          {showContent && (
            <TapGestureHandler
              ref={tapGestureOverlayRef}
              enabled={closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled}
              onHandlerStateChange={handleOverlay}
            >
              <Animated.View
                style={[s.overlay__background, overlayStyle, animatedOverlayStyle]}
                pointerEvents={pointerEvents}
              />
            </TapGestureHandler>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  useImperativeHandle(ref, () => ({
    open(dest?: Open): void {
      if (onOpen) {
        onOpen();
      }

      handleAnimateOpen(alwaysOpen, dest);
    },

    close(dest?: Close, callback?: () => void): void {
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
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return (): void => {
      backButtonListenerRef.current?.remove();
      keyboardShowListener?.remove();
      keyboardHideListener?.remove();
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <View
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
              onLayout={
                !avoidKeyboardLikeIOS && !adjustToContentHeight
                  ? handleModalizeContentLayout
                  : undefined
              }
              style={[s.modalize__content, modalStyle, animatedKeyboardAvoidingViewStyle]}
            >
              {renderHandle()}
              {renderComponent(HeaderComponent, 'header')}
              {renderChildren()}
              {renderComponent(FooterComponent, 'footer')}
            </AnimatedKeyboardAvoidingView>
          )}

          {withOverlay && renderOverlay()}
        </View>
      </TapGestureHandler>

      {renderComponent(FloatingComponent, 'floating')}
    </View>
  );
};

export type Modalize = Handles;
export const Modalize = forwardRef(ModalizeBase);
