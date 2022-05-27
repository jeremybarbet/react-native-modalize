import React, {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  EmitterSubscription,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  KeyboardEvent,
  LayoutChangeEvent,
  NativeEventSubscription,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

import { useDimensions } from './hooks/use-dimensions';
import { composeRefs } from './utils/compose-refs';
import { constants } from './utils/constants';
import { isAndroid, isIos, isIphoneX } from './utils/devices';
import { invariant } from './utils/invariant';
import { isBelowRN65, isRNGH2 } from './utils/libraries';
import { renderElement } from './utils/render-element';
import { Close, Handles, Open, Position, Props, Style } from './options';
import s from './styles';

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);

export const Modalize = forwardRef<Handles, Props>(
  (
    {
      // Refs
      contentRef,

      // Renderers
      children,
      scrollViewProps,
      flatListProps,
      sectionListProps,

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
    },
    ref,
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
    const [beginScrollYValue, setBeginScrollYValue] = useState(0);
    const [modalPosition, setModalPosition] = useState<Position>('initial');
    const [cancelClose, setCancelClose] = useState(false);
    const [layouts, setLayouts] = useState<Map<string, number>>(new Map());

    const cancelTranslateY = useRef(new Animated.Value(1)).current; // 1 by default to have the translateY animation running
    const componentTranslateY = useRef(new Animated.Value(0)).current;
    const overlay = useRef(new Animated.Value(0)).current;
    const beginScrollY = useRef(new Animated.Value(0)).current;
    const dragY = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const reverseBeginScrollY = useRef(
      Animated.multiply(new Animated.Value(-1), beginScrollY),
    ).current;

    const tapGestureModalizeRef = useRef<TapGestureHandler>(null);
    const panGestureChildrenRef = useRef<PanGestureHandler>(null);
    const nativeViewChildrenRef = useRef<NativeViewGestureHandler>(null);
    const contentViewRef = useRef<ScrollView | FlatList<any> | SectionList<any>>(null);
    const tapGestureOverlayRef = useRef<TapGestureHandler>(null);
    const backButtonListenerRef = useRef<NativeEventSubscription>(null);

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
      dest: Open = 'default',
    ): void => {
      (backButtonListenerRef as any).current = BackHandler.addEventListener(
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

      Animated.parallel([
        Animated.spring(overlay, {
          toValue: alwaysOpenValue && dest === 'default' ? 0 : 1,
          useNativeDriver: constants.useNativeDriver,
          ...constants.springConfig,
        }),

        panGestureAnimatedValue
          ? Animated.timing(panGestureAnimatedValue, {
              toValue: toPanValue,
              duration: constants.panDuration,
              easing: Easing.linear,
              useNativeDriver: constants.useNativeDriver,
            })
          : Animated.delay(0),

        Animated.spring(translateY, {
          toValue,
          useNativeDriver: constants.useNativeDriver,
          ...constants.springConfig,
        }),
      ]).start(() => {
        if (onOpened) {
          onOpened();
        }

        setModalPosition(newPosition);

        if (onPositionChange) {
          onPositionChange(newPosition);
        }
      });
    };

    const handleAnimateClose = (dest: Close = 'default', callback?: () => void): void => {
      const lastSnapValue = snapPoint ? snaps[1] : 80;
      const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
      const toValue =
        toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;

      backButtonListenerRef.current?.remove();
      cancelTranslateY.setValue(1);
      setBeginScrollYValue(0);
      beginScrollY.setValue(0);

      Animated.parallel([
        Animated.spring(overlay, {
          toValue: 0,
          useNativeDriver: constants.useNativeDriver,
          ...constants.springConfig,
        }),

        panGestureAnimatedValue
          ? Animated.timing(panGestureAnimatedValue, {
              toValue: 0,
              duration: constants.panDuration,
              easing: Easing.linear,
              useNativeDriver: constants.useNativeDriver,
            })
          : Animated.delay(0),

        Animated.spring(translateY, {
          toValue,
          useNativeDriver: constants.useNativeDriver,
          ...constants.springConfig,
        }),
      ]).start(() => {
        if (onClosed) {
          onClosed();
        }

        if (callback) {
          callback();
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
      const { velocityY, translationY } = nativeEvent;
      const negativeReverseScroll =
        modalPosition === 'top' &&
        beginScrollYValue >= (snapPoint ? 0 : constants.scrollThreshold) &&
        translationY < 0;
      const thresholdProps =
        translationY > constants.animations.threshold && beginScrollYValue === 0;
      const closeThreshold = constants.animations.velocity
        ? (beginScrollYValue <= 20 && velocityY >= constants.animations.velocity) || thresholdProps
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
          const endOffsetY = lastSnap + toValue + constants.animations.dragToss * velocityY;

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
            duration: constants.timingConfig.duration,
            easing: Easing.ease,
            useNativeDriver: constants.useNativeDriver,
          }).start();
        }

        Animated.spring(translateY, {
          tension: 50,
          friction: 12,
          velocity: velocityY,
          toValue: destSnapPoint,
          useNativeDriver: constants.useNativeDriver,
        }).start();

        if (beginScrollYValue <= 0) {
          const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

          if (panGestureAnimatedValue) {
            Animated.timing(panGestureAnimatedValue, {
              toValue: Number(modalPositionValue === 'top'),
              duration: constants.panDuration,
              easing: Easing.ease,
              useNativeDriver: constants.useNativeDriver,
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
      useNativeDriver: constants.useNativeDriver,
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

    const renderContent = (): JSX.Element => {
      const keyboardDismissMode:
        | Animated.Value
        | Animated.AnimatedInterpolation
        | 'interactive'
        | 'on-drag' = isIos ? 'interactive' : 'on-drag';
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
      const onScrollBeginDrag = passedOnProps?.onScrollBeginDrag as (
        event: NativeSyntheticEvent<NativeScrollEvent>,
      ) => void | undefined;

      const opts = {
        ref: composeRefs(contentViewRef, contentRef) as RefObject<any>,
        bounces,
        onScrollBeginDrag: Animated.event(
          [{ nativeEvent: { contentOffset: { y: beginScrollY } } }],
          {
            useNativeDriver: constants.useNativeDriver,
            listener: onScrollBeginDrag,
          },
        ),
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

      return (
        <Animated.ScrollView {...scrollViewProps} {...opts}>
          {children}
        </Animated.ScrollView>
      );
    };

    const renderChildren = (): JSX.Element => {
      const style = adjustToContentHeight ? s.content__adjustHeight : s.content__container;
      const minDist = isRNGH2() ? undefined : constants.activated;

      return (
        <PanGestureHandler
          ref={panGestureChildrenRef}
          enabled={panGestureEnabled}
          simultaneousHandlers={[nativeViewChildrenRef, tapGestureModalizeRef]}
          shouldCancelWhenOutside={false}
          onGestureEvent={handleGestureEvent}
          minDist={minDist}
          activeOffsetY={constants.activated}
          activeOffsetX={constants.activated}
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
      let keyboardShowListener: EmitterSubscription | null = null;
      let keyboardHideListener: EmitterSubscription | null = null;

      const beginScrollYListener = beginScrollY.addListener(({ value }) =>
        setBeginScrollYValue(value),
      );

      if (isBelowRN65) {
        Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
        Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
      } else {
        keyboardShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
        keyboardHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
      }

      return (): void => {
        backButtonListenerRef.current?.remove();
        beginScrollY.removeListener(beginScrollYListener);

        if (isBelowRN65) {
          Keyboard.removeListener('keyboardDidShow', handleKeyboardShow);
          Keyboard.removeListener('keyboardDidHide', handleKeyboardHide);
        } else {
          keyboardShowListener?.remove();
          keyboardHideListener?.remove();
        }
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

    if (!isVisible) {
      return null;
    }

    return renderModalize;
  },
);

export type Modalize = Handles;
