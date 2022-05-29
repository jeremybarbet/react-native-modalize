import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  BackHandler,
  EmitterSubscription,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  NativeEventSubscription,
  Platform,
  StatusBar,
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
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Child } from './components/Child';
import { Element, ElementType } from './components/Element';
import { Handle } from './components/Handle';
import { Overlay } from './components/Overlay';
import { constants } from './utils/constants';
import { invariant } from './utils/invariant';
import { isBelowRN65 } from './utils/libraries';
import { isAndroid, isIphoneX } from './utils/platform';
import { clamp } from './worklets/clamp';
import { Close, Handles, Open, Position, Props } from './options';
import { s } from './styles';

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);

export const Modalize = forwardRef<Handles, Props>(
  (
    {
      // Refs
      rendererRef,

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
    const { height: screenHeight } = useWindowDimensions();
    const isHandleOutside = handlePosition === 'outside';
    const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
    const fullHeight = screenHeight - modalTopOffset;
    const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
    const endHeight = Math.max(0, modalHeight || computedHeight);
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

    /**
     * 1 by default to have the translateY animation running
     */
    const cancelTranslateY = useSharedValue(1);
    const componentTranslateY = useSharedValue(0);
    const overlay = useSharedValue(0);
    const beginScrollY = useSharedValue(0);
    const dragY = useSharedValue(0);
    const translateY = useSharedValue(screenHeight);
    const reverseBeginScrollY = useSharedValue(-1 * beginScrollY.value);

    const tapGestureModalizeRef = useRef<TapGestureHandler | null>(null);
    const panGestureChildrenRef = useRef<PanGestureHandler | null>(null);
    const nativeViewChildrenRef = useRef<NativeViewGestureHandler | null>(null);
    const tapGestureOverlayRef = useRef<TapGestureHandler | null>(null);
    const backButtonListenerRef = useRef<NativeEventSubscription | null>(null);

    /**
     * We diff and get the negative value only. It sometimes go above 0
     * (e.g. 1.5) and creates the flickering on Modalize for a ms
     */
    const diffClamp = useDerivedValue(
      () => clamp(reverseBeginScrollY.value, -screenHeight, 0),
      [reverseBeginScrollY, screenHeight],
    );
    const componentDragEnabled = componentTranslateY.value === 1;
    /**
     * When we have a scrolling happening in the ScrollView, we don't want to translate
     * the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
     */
    const dragValue = useDerivedValue(
      () => dragY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + diffClamp.value,
      [dragY, componentDragEnabled, cancelTranslateY, diffClamp],
    );

    const computedTranslateY = useDerivedValue(
      () =>
        translateY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + dragValue.value,
      [translateY, componentDragEnabled, cancelTranslateY, dragValue],
    );

    let willCloseModalize = false;

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

    const handleBackPress = () => {
      if (alwaysOpen) {
        backButtonListenerRef.current?.remove();
        return false;
      }

      if (onBackButtonPress) {
        backButtonListenerRef.current?.remove();
        return onBackButtonPress();
      } else {
        handleClose();
        backButtonListenerRef.current?.remove();
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
      let toValue = 0;
      let toPanValue = 0;
      let newPosition: Position;

      backButtonListenerRef.current = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );

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

      // to run in parallel
      overlay.value = withSpring(
        alwaysOpenValue && dest === 'default' ? 0 : 1,
        constants.springConfig,
      );

      if (panGestureAnimatedValue) {
        panGestureAnimatedValue.value = toPanValue;
      }

      const handleFinish = () => {
        onOpened?.();
        setModalPosition(newPosition);
        onPositionChange?.(newPosition);
      };

      translateY.value = withSpring(toValue, constants.springConfig, isFinished => {
        if (isFinished) {
          runOnJS(handleFinish)();
        }
      });
    };

    const handleAnimateClose = (dest: Close = 'default', callback?: () => void) => {
      const lastSnapValue = snapPoint ? snaps[1] : 80;
      const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
      const toValue =
        toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;

      backButtonListenerRef.current?.remove();
      cancelTranslateY.value = 1;
      beginScrollY.value = 0;

      overlay.value = withSpring(0, constants.springConfig);

      if (panGestureAnimatedValue) {
        panGestureAnimatedValue.value = 0;
      }

      const handleFinish = () => {
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

      translateY.value = withSpring(toValue, constants.springConfig, isFinished => {
        if (isFinished) {
          runOnJS(handleFinish)();
        }
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
        beginScrollY.value >= (snapPoint ? 0 : constants.scrollThreshold) &&
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
          overlay.value = withSpring(Number(destSnapPoint <= 0), constants.springConfig);
        }

        translateY.value = withSpring(destSnapPoint, constants.springConfig);

        if (beginScrollY.value <= 0) {
          const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

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
        backButtonListenerRef.current?.remove();

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
                  rendererRef={rendererRef}
                  enableBounces={enableBounces}
                  keyboardToggle={keyboardToggle}
                  disableScroll={disableScroll}
                  beginScrollY={beginScrollY}
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
      </GestureHandlerRootView>
    );
  },
);

export type Modalize = Handles;
