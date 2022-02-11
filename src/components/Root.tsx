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
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
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

import { Child } from './components/Child';
import { Element } from './components/Element';
import { Handle } from './components/Handle';
import { Overlay } from './components/Overlay';
import { useDimensions } from './hooks/use-dimensions';
import { clamp } from './utils/clamp';
import { composeRefs } from './utils/compose-refs';
import { isAndroid, isIos, isIphoneX } from './utils/devices';
import { invariant } from './utils/invariant';
import { renderElement } from './utils/render-element';
import { Close, Handles, ModalizeProps, Open, Position, Style } from './options';
import s from './styles';

const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);

const AnimatedSectionList = Animated.createAnimatedComponent(
  SectionList as new () => SectionList<unknown>,
);

/**
 * When scrolling, it happens than beginScrollYValue is not always equal to 0 (top of the ScrollView).
 * Since we use this to trigger the swipe down gesture animation, we allow a small threshold to
 * not dismiss Modalize when we are using the ScrollView and we don't want to dismiss.
 */
const SCROLL_THRESHOLD = -4;
const ACTIVATED = 20;
const PAN_DURATION = 150;

export const Root = (
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
    `You have defined 'sectionListProps' along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'sectionListProps' to fix the error.`,
  );

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
      easing: Easing.ease,
    });

    if (panGestureAnimatedValue) {
      panGestureAnimatedValue.value = withTiming(toPanValue, {
        duration: PAN_DURATION,
        easing: Easing.ease,
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
          easing: Easing.ease,
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

  const handleClose = (dest?: Close, callback?: () => void): void => {
    if (onClose) {
      onClose();
    }

    handleAnimateClose(dest, callback);
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
              <Handle
                dragY={dragY}
                panGestureEnabled={panGestureEnabled}
                handlePosition={handlePosition}
                handleStyle={handleStyle}
                withHandle={withHandle}
                onClose={handleAnimateClose}
              />

              {/* <Element
                id="header"
                component={HeaderComponent}
                panGestureComponentEnabled={panGestureComponentEnabled}
              />

              <Child />

              <Element
                id="footer"
                component={HeaderComponent}
                panGestureComponentEnabled={panGestureComponentEnabled}
              /> */}
            </AnimatedKeyboardAvoidingView>
          )}

          <Overlay
            dragY={dragY}
            overlay={overlay}
            panGestureEnabled={panGestureEnabled}
            overlayStyle={overlayStyle}
            alwaysOpen={alwaysOpen}
            closeOnOverlayTap={closeOnOverlayTap}
            withOverlay={withOverlay}
            showContent={showContent}
            modalPosition={modalPosition}
            onClose={handleAnimateClose}
            onOverlayPress={onOverlayPress}
          />
        </View>
      </TapGestureHandler>

      {/* <Element
        id="floating"
        component={FloatingComponent}
        panGestureComponentEnabled={panGestureComponentEnabled}
      /> */}
    </View>
  );
};

// export type Modalize = Handles;
// export const Modalize = forwardRef(ModalizeBase);
