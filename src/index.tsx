/**
 * esModuleInterop: true looks to work everywhere except
 * on snack.expo for some reason. Will revisit this later.
 */
import * as React from 'react';
import {
  Animated,
  View,
  Dimensions,
  Modal,
  Easing,
  LayoutChangeEvent,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  FlatList,
  SectionList,
  Platform,
  StatusBar,
  KeyboardEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  KeyboardAvoidingViewProps,
} from 'react-native';
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

import { IProps, TOpen, TClose, TStyle, IHandles } from './options';
import { getSpringConfig } from './utils/get-spring-config';
import { isIphoneX, isIos, isAndroid } from './utils/devices';
import { invariant } from './utils/invariant';
import { composeRefs } from './utils/compose-refs';
import s from './styles';

const { height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
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
      spring: { speed: 14, bounciness: 4 },
    },
    closeAnimationConfig = {
      timing: { duration: 240, easing: Easing.ease },
    },
    dragToss = 0.18,
    threshold = 120,
    velocity = 2800,
    panGestureAnimatedValue,
    useNativeDriver = true,

    // Elements visibilities
    withReactModal = false,
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
  }: IProps,
  ref: React.Ref<React.ReactNode>,
): JSX.Element | null => {
  const isHandleOutside = handlePosition === 'outside';
  const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
  const fullHeight = screenHeight - modalTopOffset;
  const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
  const endHeight = modalHeight || computedHeight;
  const adjustValue = adjustToContentHeight ? undefined : endHeight;
  const snaps = snapPoint ? [0, endHeight - snapPoint, endHeight] : [0, endHeight];

  const [modalHeightValue, setModalHeightValue] = React.useState(adjustValue);
  const [lastSnap, setLastSnap] = React.useState(snapPoint ? endHeight - snapPoint : 0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [showContent, setShowContent] = React.useState(true);
  const [enableBounces, setEnableBounces] = React.useState(true);
  const [keyboardToggle, setKeyboardToggle] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [disableScroll, setDisableScroll] = React.useState(
    alwaysOpen || snapPoint ? true : undefined,
  );
  const [beginScrollYValue, setBeginScrollYValue] = React.useState(0);
  const [modalPosition, setModalPosition] = React.useState<'top' | 'initial'>('initial');
  const [cancelClose, setCancelClose] = React.useState(false);

  const cancelTranslateY = React.useRef(new Animated.Value(1)).current; // 1 by default to have the translateY animation running
  const componentTranslateY = React.useRef(new Animated.Value(0)).current;
  const overlay = React.useRef(new Animated.Value(0)).current;
  const beginScrollY = React.useRef(new Animated.Value(0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(screenHeight)).current;
  const reverseBeginScrollY = React.useRef(Animated.multiply(new Animated.Value(-1), beginScrollY))
    .current;

  const tapGestureModalizeRef = React.useRef<TapGestureHandler>(null);
  const panGestureChildrenRef = React.useRef<PanGestureHandler>(null);
  const nativeViewChildrenRef = React.useRef<NativeViewGestureHandler>(null);
  const contentViewRef = React.useRef<
    Animated.AnimatedComponent<ScrollView | FlatList<any> | SectionList<any>>
  >(null);
  const tapGestureOverlayRef = React.useRef<TapGestureHandler>(null);

  // We diff and get the negative value only. It sometimes go above 0
  // (e.g. 1.5) and creates the flickering on Modalize for a ms
  const diffClamp = Animated.diffClamp(reverseBeginScrollY, -screenHeight, 0);
  const componentDragEnabled = (componentTranslateY as any)._value === 1;
  // When we have a scrolling happening in the ScrollView, we don't want to translate
  // the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
  const dragValue = Animated.add(
    Animated.multiply(dragY, componentDragEnabled ? 1 : cancelTranslateY),
    diffClamp,
  );
  const value = Animated.add(
    Animated.multiply(translateY, componentDragEnabled ? 1 : cancelTranslateY),
    dragValue,
  );

  let willCloseModalize = false;

  beginScrollY.addListener(({ value }) => setBeginScrollYValue(value));

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

  const handleAnimateOpen = (
    alwaysOpenValue: number | undefined,
    dest: TOpen = 'default',
  ): void => {
    const { timing, spring } = openAnimationConfig;

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    let toValue = 0;
    let toPanValue = 0;

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
      setModalPosition('initial');
    } else {
      setModalPosition('top');
    }

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: alwaysOpenValue && dest === 'default' ? 0 : 1,
        duration: timing.duration,
        easing: Easing.ease,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),

      panGestureAnimatedValue
        ? Animated.timing(panGestureAnimatedValue, {
            toValue: toPanValue,
            duration: PAN_DURATION,
            easing: Easing.ease,
            useNativeDriver,
          })
        : Animated.delay(0),

      spring
        ? Animated.spring(translateY, {
            ...getSpringConfig(spring),
            toValue,
            useNativeDriver: USE_NATIVE_DRIVER,
          })
        : Animated.timing(translateY, {
            toValue,
            duration: timing.duration,
            easing: timing.easing,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
    ]).start(() => {
      if (onOpened) {
        onOpened();
      }

      if (onPositionChange) {
        onPositionChange(modalPosition);
      }
    });
  };

  const handleAnimateClose = (dest: TClose = 'default'): void => {
    const { timing, spring } = closeAnimationConfig;
    const lastSnapValue = snapPoint ? snaps[1] : 80;
    const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
    const toValue =
      toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;

    BackHandler.removeEventListener('hardwareBackPress', handleBackPress);

    cancelTranslateY.setValue(1);
    setBeginScrollYValue(0);
    beginScrollY.setValue(0);

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: timing.duration,
        easing: Easing.ease,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),

      panGestureAnimatedValue
        ? Animated.timing(panGestureAnimatedValue, {
            toValue: 0,
            duration: PAN_DURATION,
            easing: Easing.ease,
            useNativeDriver,
          })
        : Animated.delay(0),

      spring
        ? Animated.spring(translateY, {
            ...getSpringConfig(spring),
            toValue,
            useNativeDriver: USE_NATIVE_DRIVER,
          })
        : Animated.timing(translateY, {
            duration: timing.duration,
            easing: Easing.out(Easing.ease),
            toValue,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
    ]).start(() => {
      if (onClosed) {
        onClosed();
      }

      if (alwaysOpen && dest === 'alwaysOpen' && onPositionChange) {
        onPositionChange('initial');
      }

      if (alwaysOpen && dest === 'alwaysOpen') {
        setModalPosition('initial');
      }

      setShowContent(toInitialAlwaysOpen);
      translateY.setValue(toValue);
      dragY.setValue(0);
      willCloseModalize = false;
      setLastSnap(lastSnapValue);
      setIsVisible(toInitialAlwaysOpen);
    });
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

  const handleContentLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
    if (onLayout) {
      onLayout(nativeEvent);
    }

    if (alwaysOpen && adjustToContentHeight) {
      const { height } = nativeEvent.layout;

      return setModalHeightValue(height);
    }

    if (!adjustToContentHeight) {
      return;
    }

    const { height } = nativeEvent.layout;
    const shorterHeight = height < endHeight;

    setDisableScroll(shorterHeight && disableScrollIfPossible);
  };

  const handleClose = (dest?: TClose): void => {
    if (onClose) {
      onClose();
    }

    handleAnimateClose(dest);
  };

  const handleChildren = (
    { nativeEvent }: PanGestureHandlerStateChangeEvent,
    type?: 'component' | 'children',
  ): void => {
    const { timing } = closeAnimationConfig;
    const { velocityY, translationY } = nativeEvent;
    const negativeReverseScroll =
      modalPosition === 'top' &&
      beginScrollYValue >= (snapPoint ? 0 : SCROLL_THRESHOLD) &&
      translationY < 0;
    const thresholdProps = translationY > threshold && beginScrollYValue === 0;
    const closeThreshold = velocity
      ? (beginScrollYValue <= 20 && velocityY >= velocity) || thresholdProps
      : thresholdProps;
    let enableBouncesValue = true;

    // We make sure to reset the value if we are dragging from the children
    if (type !== 'component' && (cancelTranslateY as any)._value === 0) {
      componentTranslateY.setValue(0);
    }

    /*
     * When the pan gesture began we check the position of the ScrollView "cursor".
     * We cancel the translation animation if the ScrollView is not scrolled to the top
     */
    if (nativeEvent.oldState === State.BEGAN) {
      setCancelClose(false);

      if (
        !closeSnapPointStraightEnabled && snapPoint
          ? beginScrollYValue > 0
          : beginScrollYValue > 0 || negativeReverseScroll
      ) {
        setCancelClose(true);
        translateY.setValue(0);
        dragY.setValue(0);
        cancelTranslateY.setValue(0);
        enableBouncesValue = true;
      } else {
        cancelTranslateY.setValue(1);
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
        ? beginScrollYValue > 0 || translationY < 0
        : enableBouncesValue,
    );

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - beginScrollYValue;
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
          if (distFromSnap < diffPoint && alwaysOpen && beginScrollYValue <= 0) {
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
      translateY.extractOffset();
      translateY.setValue(toValue);
      translateY.flattenOffset();
      dragY.setValue(0);

      if (alwaysOpen) {
        Animated.timing(overlay, {
          toValue: Number(destSnapPoint <= 0),
          duration: timing.duration,
          easing: Easing.ease,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      }

      Animated.spring(translateY, {
        tension: 50,
        friction: 12,
        velocity: velocityY,
        toValue: destSnapPoint,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();

      if (beginScrollYValue <= 0) {
        const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

        if (panGestureAnimatedValue) {
          Animated.timing(panGestureAnimatedValue, {
            toValue: Number(modalPositionValue === 'top'),
            duration: PAN_DURATION,
            easing: Easing.ease,
            useNativeDriver,
          }).start();
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
      componentTranslateY.setValue(1);
      beginScrollY.setValue(0);
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

  const renderHandle = (): JSX.Element | null => {
    const handleStyles: (TStyle | undefined)[] = [s.handle];
    const shapeStyles: (TStyle | undefined)[] = [s.handle__shape, handleStyle];

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

  const renderComponent = (component: React.ReactNode): JSX.Element | null => {
    if (!component) {
      return null;
    }

    const renderElement = (Element: React.ReactNode): JSX.Element =>
      typeof Element === 'function' ? Element() : Element;
    const tag = renderElement(component);

    /**
     * Nesting Touchable/ScrollView components with RNGH PanGestureHandler cancels the inner events.
     * Until a better solution lands in RNGH, I will disable the PanGestureHandler for Android only,
     * so inner touchable/gestures are working from the custom components you can pass in.
     */
    if (isAndroid && !panGestureComponentEnabled) {
      return tag;
    }

    const zIndex: number | undefined = StyleSheet.flatten(tag?.props?.style)?.zIndex;

    return (
      <PanGestureHandler
        enabled={panGestureEnabled}
        shouldCancelWhenOutside={false}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleComponent}
      >
        <Animated.View style={{ zIndex }}>{tag}</Animated.View>
      </PanGestureHandler>
    );
  };

  const renderContent = (): JSX.Element => {
    const keyboardDismissMode = isIos ? 'interactive' : 'on-drag';
    const passedOnScrollBeginDrag = (flatListProps ?? sectionListProps ?? scrollViewProps)
      ?.onScrollBeginDrag as (event: NativeSyntheticEvent<NativeScrollEvent>) => void | undefined;

    const opts = {
      ref: composeRefs(contentRef, contentViewRef),
      bounces: enableBounces,
      onScrollBeginDrag: Animated.event([{ nativeEvent: { contentOffset: { y: beginScrollY } } }], {
        useNativeDriver: USE_NATIVE_DRIVER,
        listener: passedOnScrollBeginDrag,
      }),
      scrollEventThrottle: 16,
      onLayout: handleContentLayout,
      scrollEnabled: keyboardToggle || !disableScroll,
      keyboardDismissMode,
    };

    if (flatListProps) {
      return <AnimatedFlatList {...flatListProps} {...opts} />;
    }

    if (sectionListProps) {
      return <AnimatedSectionList {...sectionListProps} {...opts} />;
    }

    if (customRenderer) {
      return React.cloneElement(customRenderer, { ...opts });
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
        minDist={ACTIVATED}
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
              enabled={panGestureEnabled || closeOnOverlayTap}
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

  React.useImperativeHandle(ref, () => ({
    open(dest?: TOpen): void {
      if (onOpen) {
        onOpen();
      }

      handleAnimateOpen(alwaysOpen, dest);
    },

    close(dest?: TClose): void {
      handleClose(dest);
    },
  }));

  React.useEffect(() => {
    if (alwaysOpen && (modalHeightValue || adjustToContentHeight)) {
      handleAnimateOpen(alwaysOpen);
    }
  }, [alwaysOpen, modalHeightValue]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    const value = adjustToContentHeight ? undefined : endHeight;

    setModalHeightValue(value);
  }, [adjustToContentHeight]);

  React.useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return (): void => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      Keyboard.removeListener('keyboardDidShow', handleKeyboardShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardHide);
    };
  }, []);

  const keyboardAvoidingViewProps: Animated.AnimatedProps<KeyboardAvoidingViewProps> = {
    keyboardVerticalOffset: keyboardAvoidingOffset,
    behavior: keyboardAvoidingBehavior,
    enabled: avoidKeyboardLikeIOS,
    style: [
      s.modalize__content,
      modalStyle,
      {
        height: modalHeightValue,
        maxHeight: endHeight,
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [-40, 0, endHeight],
              outputRange: [0, 0, endHeight],
              extrapolate: 'clamp',
            }),
          },
        ],
      },
    ],
  };

  if (!avoidKeyboardLikeIOS && !adjustToContentHeight) {
    keyboardAvoidingViewProps.onLayout = handleModalizeContentLayout;
  }

  const renderModalize = (
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
            <AnimatedKeyboardAvoidingView {...keyboardAvoidingViewProps}>
              {renderHandle()}
              {renderComponent(HeaderComponent)}
              {renderChildren()}
              {renderComponent(FooterComponent)}
            </AnimatedKeyboardAvoidingView>
          )}

          {withOverlay && renderOverlay()}
        </View>
      </TapGestureHandler>

      {renderComponent(FloatingComponent)}
    </View>
  );

  const renderReactModal = (child: JSX.Element): JSX.Element => (
    <Modal
      supportedOrientations={['landscape', 'portrait', 'portrait-upside-down']}
      onRequestClose={handleBackPress}
      hardwareAccelerated={USE_NATIVE_DRIVER}
      visible={isVisible}
      transparent
    >
      {child}
    </Modal>
  );

  if (!isVisible) {
    return null;
  }

  if (withReactModal) {
    return renderReactModal(renderModalize);
  }

  return renderModalize;
};

export type Modalize = IHandles;
export const Modalize = React.forwardRef(ModalizeBase);
