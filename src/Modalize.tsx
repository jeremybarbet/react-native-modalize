import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
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
  Platform,
  ScrollView,
  SectionList,
  StatusBar,
  View,
} from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';

import { Child } from './components/Child';
import { Element, ElementType } from './components/Element';
import { Handle } from './components/Handle';
import { Overlay } from './components/Overlay';
import { useDimensions } from './hooks/use-dimensions';
import { constants } from './utils/constants';
import { invariant } from './utils/invariant';
import { isBelowRN65 } from './utils/libraries';
import { isAndroid, isIphoneX } from './utils/platform';
import { Close, Handles, Open, Position, Props } from './options';
import { s } from './styles';

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
  ) => {
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

    const handleBackPress = () => {
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

    const handleKeyboardShow = (event: KeyboardEvent) => {
      const { height } = event.endCoordinates;

      setKeyboardToggle(true);
      setKeyboardHeight(height);
    };

    const handleKeyboardHide = () => {
      setKeyboardToggle(false);
      setKeyboardHeight(0);
    };

    const handleAnimateOpen = (alwaysOpenValue: number | undefined, dest: Open = 'default') => {
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
        onOpened?.();
        setModalPosition(newPosition);
        onPositionChange?.(newPosition);
      });
    };

    const handleAnimateClose = (dest: Close = 'default', callback?: () => void) => {
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
        onClosed?.();
        callback?.();

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

    const handleClose = (dest?: Close, callback?: () => void) => {
      onClose?.();
      handleAnimateClose(dest, callback);
    };

    const handleChildren = (
      { nativeEvent }: PanGestureHandlerStateChangeEvent,
      type?: 'component' | 'children',
    ) => {
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

    const handleElement = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
      // If we drag from the HeaderComponent/FooterComponent/FloatingComponent we allow the translation animation
      if (nativeEvent.oldState === State.BEGAN) {
        componentTranslateY.setValue(1);
        beginScrollY.setValue(0);
      }

      handleChildren({ nativeEvent }, 'component');
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

      return () => {
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

    if (!isVisible) {
      return null;
    }

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
              <AnimatedKeyboardAvoidingView {...keyboardAvoidingViewProps}>
                <Handle
                  panGestureEnabled={panGestureEnabled}
                  withHandle={withHandle}
                  handleStyle={handleStyle}
                  tapGestureModalizeRef={tapGestureModalizeRef}
                  isHandleOutside={isHandleOutside}
                  onGestureEvent={handleGestureEvent}
                  onHandlerStateChange={handleChildren}
                />

                <Element
                  id={ElementType.header}
                  component={HeaderComponent}
                  panGestureEnabled={panGestureEnabled}
                  panGestureComponentEnabled={panGestureComponentEnabled}
                  onGestureEvent={handleGestureEvent}
                  onHandlerStateChange={handleElement}
                  onComponentLayout={handleComponentLayout}
                />

                <Child
                  panGestureEnabled={panGestureEnabled}
                  adjustToContentHeight={adjustToContentHeight}
                  flatListProps={flatListProps}
                  sectionListProps={sectionListProps}
                  scrollViewProps={scrollViewProps}
                  childrenStyle={childrenStyle}
                  contentRef={contentRef}
                  enableBounces={enableBounces}
                  keyboardToggle={keyboardToggle}
                  disableScroll={disableScroll}
                  beginScrollY={beginScrollY}
                  nativeViewChildrenRef={nativeViewChildrenRef}
                  tapGestureModalizeRef={tapGestureModalizeRef}
                  contentViewRef={contentViewRef}
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
                  panGestureEnabled={panGestureEnabled}
                  panGestureComponentEnabled={panGestureComponentEnabled}
                  onGestureEvent={handleGestureEvent}
                  onHandlerStateChange={handleElement}
                  onComponentLayout={handleComponentLayout}
                />
              </AnimatedKeyboardAvoidingView>
            )}

            <Overlay
              alwaysOpen={alwaysOpen}
              panGestureEnabled={panGestureEnabled}
              withOverlay={withOverlay}
              closeOnOverlayTap={closeOnOverlayTap}
              overlayStyle={overlayStyle}
              onOverlayPress={onOverlayPress}
              modalPosition={modalPosition}
              tapGestureOverlayRef={tapGestureOverlayRef}
              showContent={showContent}
              willCloseModalize={willCloseModalize}
              overlay={overlay}
              onGestureEvent={handleGestureEvent}
              onHandlerStateChange={handleChildren}
              onClose={handleClose}
            />
          </View>
        </TapGestureHandler>

        <Element
          id={ElementType.floating}
          component={FloatingComponent}
          panGestureEnabled={panGestureEnabled}
          panGestureComponentEnabled={panGestureComponentEnabled}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleElement}
          onComponentLayout={handleComponentLayout}
        />
      </View>
    );
  },
);

export type Modalize = Handles;
