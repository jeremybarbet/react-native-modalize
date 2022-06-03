import React, {
  createContext,
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BackHandler, NativeEventSubscription, useWindowDimensions } from 'react-native';
import {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedGestureHandler,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useInternalProps } from '../contexts/InternalPropsProvider';
import { Callback, Close, Open, Position } from '../options';
import { constants } from '../utils/constants';
import { isAndroid, isIphoneX } from '../utils/platform';
import { clamp } from '../worklets/clamp';

interface InternalLogicContextProps {
  // Animations
  translateY: SharedValue<number>;
  cancelTranslateY: SharedValue<number>;
  componentTranslateY: SharedValue<number>;
  dragY: SharedValue<number>;
  beginDragY: SharedValue<number>;
  reverseDragY: SharedValue<number>;
  overlay: SharedValue<number>;

  // Derived
  derivedTranslateY: Readonly<SharedValue<number>>;

  // Variables
  isHandleOutside: boolean;
  handleHeight: number;
  fullHeight: number;
  computedHeight: number;
  endHeight: number;
  adjustValue: number | undefined;
  snaps: number[];

  // States
  modalHeightValue: number | undefined;
  setModalHeightValue: Dispatch<SetStateAction<number | undefined>>;
  lastSnap: number;
  setLastSnap: Dispatch<SetStateAction<number>>;
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  showContent: boolean;
  setShowContent: Dispatch<SetStateAction<boolean>>;
  enableBounces: boolean;
  setEnableBounces: Dispatch<SetStateAction<boolean>>;
  keyboardToggle: boolean;
  setKeyboardToggle: Dispatch<SetStateAction<boolean>>;
  keyboardHeight: number;
  setKeyboardHeight: Dispatch<SetStateAction<number>>;
  disableScroll: boolean | undefined;
  setDisableScroll: Dispatch<SetStateAction<boolean | undefined>>;
  modalPosition: Position;
  setModalPosition: Dispatch<SetStateAction<Position>>;
  cancelClose: boolean;
  setCancelClose: Dispatch<SetStateAction<boolean>>;
  layouts: Map<string, number>;
  setLayouts: Dispatch<SetStateAction<Map<string, number>>>;
  willCloseModalize: MutableRefObject<boolean>;

  // Methods
  handleGestureUpdate(event: GestureUpdateEvent<PanGestureHandlerEventPayload>): void;
  handleGestureEnd(event: GestureStateChangeEvent<PanGestureHandlerEventPayload>): void;
  handleOpen(alwaysOpenValue: number | undefined, dest?: Open): void;
  handleClose(dest: Close, callback?: Callback): void;

  // deprecated
  deprecated__handleChildren: any;
  deprecated__handleGestureEvent: any;
}

const InternalLogicContext = createContext<InternalLogicContextProps>(
  {} as InternalLogicContextProps,
);

export const InternalLogicProvider: FC = ({ children }) => {
  const { height: screenHeight } = useWindowDimensions();

  const {
    snapPoint,
    modalHeight,
    modalTopOffset,
    alwaysOpen,
    adjustToContentHeight,
    handlePosition,
    withHandle,
    panGestureSharedValue,
    closeSnapPointStraightEnabled,
    tapGestureEnabled,
    onOpened,
    onClosed,
    onPositionChange,
    onBackButtonPress,
  } = useInternalProps();

  const translateY = useSharedValue(screenHeight);
  const cancelTranslateY = useSharedValue(1); // 1 by default to have the translateY animation running
  const componentTranslateY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const beginDragY = useSharedValue(0);
  const reverseDragY = useSharedValue(-1 * beginDragY.value);
  const overlay = useSharedValue(0);

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

  const backButtonListenerRef = useRef<NativeEventSubscription | null>(null);
  const willCloseModalize = useRef(false);

  /**
   * We diff and get the negative value only. It sometimes go above 0
   * (e.g. 1.5) and creates the flickering on Modalize for a ms
   */
  const diffClamp = useDerivedValue(
    () => clamp(reverseDragY.value, -screenHeight, 0),
    [reverseDragY, screenHeight],
  );

  const componentDragEnabled = componentTranslateY.value === 1;

  /**
   * When we have a scrolling happening in the ScrollView, we don't want to translate
   * the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
   */
  const derivedDragY = useDerivedValue(
    () => dragY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + diffClamp.value,
    [componentDragEnabled, cancelTranslateY, diffClamp],
  );

  const derivedTranslateY = useDerivedValue(
    () =>
      translateY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + derivedDragY.value,
    [translateY, componentDragEnabled, cancelTranslateY, derivedDragY],
  );

  const handleClearBackButtonListener = () => {
    if (isAndroid) {
      backButtonListenerRef.current?.remove();
    }
  };

  const handleBackPress = () => {
    if (alwaysOpen) {
      handleClearBackButtonListener();
      return false;
    }

    if (onBackButtonPress) {
      handleClearBackButtonListener();
      return onBackButtonPress();
    } else {
      handleClose();
      handleClearBackButtonListener();
    }

    return true;
  };

  const handleOpenFinished = (alwaysOpenValue: number | undefined, dest: Open = 'default') => {
    const newPosition =
      (alwaysOpenValue && dest !== 'top') || (snapPoint && dest === 'default') ? 'initial' : 'top';

    setModalPosition(newPosition);
    onPositionChange?.(newPosition);
    onOpened?.();
  };

  const handleOpen = (alwaysOpenValue: number | undefined, dest: Open = 'default') => {
    /**
     * We register a listener for the hardware back button on Android
     */
    if (isAndroid) {
      backButtonListenerRef.current = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
    }

    /**
     * Before starting animating, we show the component
     */
    setIsVisible(true);
    setShowContent(true);

    /**
     * Start animating the overlay component, individually from the sheet
     */
    overlay.value = withSpring(
      alwaysOpenValue && dest === 'default' ? 0 : 1,
      constants.springConfig,
    );

    /**
     * We check in which state the sheet is and animate to the correct position
     */
    const toValue = alwaysOpenValue
      ? (modalHeightValue || 0) - alwaysOpenValue
      : snapPoint
      ? (modalHeightValue || 0) - snapPoint
      : 0;

    translateY.value = withSpring(toValue, constants.springConfig, isFinished => {
      if (isFinished) {
        runOnJS(handleOpenFinished)(alwaysOpenValue, dest);
      }
    });

    /**
     * If user registered a panGestureSharedValue props, we set the value while the sheet is opening
     */
    if (panGestureSharedValue) {
      const toValue = !alwaysOpenValue && (dest === 'top' || dest === 'default') ? 1 : 0;

      panGestureSharedValue.value = withTiming(toValue, { easing: Easing.linear });
    }
  };

  const handleCloseFinished = (toInitialAlwaysOpen: boolean, dest: Close, callback?: Callback) => {
    const lastSnapValue = snapPoint ? snaps[1] : 80;

    setShowContent(toInitialAlwaysOpen);
    setLastSnap(lastSnapValue);
    setIsVisible(toInitialAlwaysOpen);
    handleClearBackButtonListener();

    dragY.value = 0;
    willCloseModalize.current = false;

    if (alwaysOpen && dest === 'alwaysOpen' && onPositionChange) {
      onPositionChange('initial');
    }

    if (alwaysOpen && dest === 'alwaysOpen') {
      setModalPosition('initial');
    }

    onClosed?.();
    callback?.();
  };

  const handleClose = (dest: Close = 'default', callback?: Callback) => {
    const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);

    /**
     * We reset a few value to their initial state
     */
    cancelTranslateY.value = 1;
    beginDragY.value = 0;

    /**
     * We animate the overlay individually from the sheet
     */
    overlay.value = withSpring(0, constants.springConfig);

    /**
     * We check in which state the sheet is and animate to the correct position
     */
    const toValue =
      toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;

    translateY.value = withSpring(toValue, constants.springConfig, isFinished => {
      if (isFinished) {
        runOnJS(handleCloseFinished)(toInitialAlwaysOpen, dest, callback);
      }
    });

    /**
     * If user registered a panGestureSharedValue props, we set the value while the sheet is opening
     */
    if (panGestureSharedValue) {
      panGestureSharedValue.value = withTiming(0, { easing: Easing.linear });
    }
  };

  const handleGestureUpdate = ({
    velocityY,
    translationY,
  }: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
    'worklet';

    console.log('---------> handleGestureUpdate');

    translateY.value = translationY;
  };

  // const handleGestureUpdate = ({
  //   velocityY,
  //   translationY,
  // }: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
  //   console.log('---------> handleGestureUpdate');

  //   // should be shared
  //   const negativeReverseScroll =
  //     modalPosition === 'top' &&
  //     dragY.value >= (snapPoint ? 0 : constants.scrollThreshold) &&
  //     translationY < 0;

  //   // should be shared
  //   const thresholdProps =
  //     translationY > constants.animations.threshold && dragY.value === 0;

  //   // should be shared
  //   const closeThreshold = constants.animations.velocity
  //     ? (dragY.value <= 20 && velocityY >= constants.animations.velocity) || thresholdProps
  //     : thresholdProps;

  //   const toValue = translationY - dragY.value;
  //   let destSnapPoint = 0;

  //   // translateY.value = translationY;

  //   if (panGestureSharedValue) {
  //     const offset = alwaysOpen ?? snapPoint ?? 0;
  //     const diff = Math.abs(translationY / (endHeight - offset));
  //     const y = translationY <= 0 ? diff : 1 - diff;
  //     let value: number;

  //     if (modalPosition === 'initial' && translationY > 0) {
  //       value = 0;
  //     } else if (modalPosition === 'top' && translationY <= 0) {
  //       value = 1;
  //     } else {
  //       value = y;
  //     }

  //     panGestureSharedValue.value = value;
  //   }

  //   if (snapPoint || alwaysOpen) {
  //     const endOffsetY = lastSnap + toValue + constants.animations.dragToss * velocityY;

  //     /**
  //      * snapPoint and alwaysOpen use both an array of points to define the first open state and the final state.
  //      */
  //     snaps.forEach((snap: number) => {
  //       const distFromSnap = Math.abs(snap - endOffsetY);
  //       const diffPoint = Math.abs(destSnapPoint - endOffsetY);

  //       // For snapPoint
  //       if (distFromSnap < diffPoint && !alwaysOpen) {
  //         if (closeSnapPointStraightEnabled) {
  //           if (modalPosition === 'initial' && negativeReverseScroll) {
  //             destSnapPoint = snap;
  //             willCloseModalize.current = false;
  //           }

  //           if (snap === endHeight) {
  //             destSnapPoint = snap;
  //             willCloseModalize.current = true;
  //             handleClose();
  //           }
  //         } else {
  //           destSnapPoint = snap;
  //           willCloseModalize.current = false;

  //           if (snap === endHeight) {
  //             willCloseModalize.current = true;
  //             handleClose();
  //           }
  //         }
  //       }

  //       // For alwaysOpen props
  //       if (distFromSnap < diffPoint && alwaysOpen && dragY.value <= 0) {
  //         destSnapPoint = (modalHeightValue || 0) - alwaysOpen;
  //         willCloseModalize.current = false;
  //       }
  //     });
  //   } else if (closeThreshold && !alwaysOpen && !cancelClose) {
  //     willCloseModalize.current = true;
  //     handleClose();
  //   }

  //   if (willCloseModalize.current) {
  //     return;
  //   }

  //   setLastSnap(destSnapPoint);
  //   // translateY.value = toValue;

  //   if (alwaysOpen) {
  //     overlay.value = withSpring(Number(destSnapPoint <= 0), constants.springConfig);
  //   }

  //   if (dragY.value <= 0) {
  //     const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

  //     if (panGestureSharedValue) {
  //       panGestureSharedValue.value = Number(modalPositionValue === 'top');
  //     }

  //     if (!adjustToContentHeight && modalPositionValue === 'top') {
  //       setDisableScroll(false);
  //     }

  //     if (onPositionChange && modalPosition !== modalPositionValue) {
  //       onPositionChange(modalPositionValue);
  //     }

  //     if (modalPosition !== modalPositionValue) {
  //       setModalPosition(modalPositionValue);
  //     }
  //   }

  //   // translateY.value = withSpring(snapPoint ? destSnapPoint : toValue, constants.springConfig);
  //   translateY.value = withSpring(translationY, constants.springConfig);
  // };

  // const handleGestureEnd = ({
  //   state,
  //   translationY,
  // }: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
  //   console.log('---------> handleGestureEnd');
  //   console.log('-state', state);

  //   const negativeReverseScroll =
  //     modalPosition === 'top' &&
  //     dragY.value >= (snapPoint ? 0 : constants.scrollThreshold) &&
  //     translationY < 0;
  //   let enableBouncesValue = true;

  //   // if (state === State.BEGAN) {
  //   setCancelClose(false);

  //   if (
  //     !closeSnapPointStraightEnabled && snapPoint
  //       ? dragY.value > 0
  //       : dragY.value > 0 || negativeReverseScroll
  //   ) {
  //     setCancelClose(true);
  //     translateY.value = withSpring(0, constants.springConfig);
  //     cancelTranslateY.value = 0;
  //     enableBouncesValue = true;
  //   } else {
  //     cancelTranslateY.value = 1;
  //     enableBouncesValue = false;

  //     if (!tapGestureEnabled) {
  //       setDisableScroll(
  //         (Boolean(snapPoint) || Boolean(alwaysOpen)) && modalPosition === 'initial',
  //       );
  //     }

  //     setEnableBounces(
  //       isAndroid
  //         ? false
  //         : alwaysOpen
  //         ? dragY.value > 0 || translationY < 0
  //         : enableBouncesValue,
  //     );
  //   }
  //   // }
  // };

  const deprecated__handleChildren = (
    { nativeEvent }: PanGestureHandlerStateChangeEvent,
    type?: 'component' | 'children',
  ) => {
    const { velocityY, translationY } = nativeEvent;
    const negativeReverseScroll =
      modalPosition === 'top' &&
      beginDragY.value >= (snapPoint ? 0 : constants.scrollThreshold) &&
      translationY < 0;
    const thresholdProps = translationY > constants.animations.threshold && beginDragY.value === 0;
    const closeThreshold = constants.animations.velocity
      ? (beginDragY.value <= 20 && velocityY >= constants.animations.velocity) || thresholdProps
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
          ? beginDragY.value > 0
          : beginDragY.value > 0 || negativeReverseScroll
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
        ? beginDragY.value > 0 || translationY < 0
        : enableBouncesValue,
    );

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - beginDragY.value;
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
                willCloseModalize.current = false;
              }

              if (snap === endHeight) {
                destSnapPoint = snap;
                willCloseModalize.current = true;
                handleClose();
              }
            } else {
              destSnapPoint = snap;
              willCloseModalize.current = false;

              if (snap === endHeight) {
                willCloseModalize.current = true;
                handleClose();
              }
            }
          }

          // For alwaysOpen props
          if (distFromSnap < diffPoint && alwaysOpen && beginDragY.value <= 0) {
            destSnapPoint = (modalHeightValue || 0) - alwaysOpen;
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

      setLastSnap(destSnapPoint);
      // translateY.value = toValue;
      dragY.value = 0;

      if (alwaysOpen) {
        overlay.value = withSpring(Number(destSnapPoint <= 0), constants.springConfig);
      }

      translateY.value = withSpring(destSnapPoint, constants.springConfig);

      if (beginDragY.value <= 0) {
        const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';

        if (panGestureSharedValue) {
          panGestureSharedValue.value = Number(modalPositionValue === 'top');
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

  const deprecated__handleGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      dragY.value = translationY;

      if (panGestureSharedValue) {
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

        panGestureSharedValue.value = value;
      }
    },
  });

  const handleGestureEnd = ({
    state,
    translationY,
    velocityY,
  }: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    'worklet';

    console.log('---------> handleGestureEnd');
    console.log('-state', state);

    const thresholdProps = translationY > constants.animations.threshold && dragY.value === 0;

    const closeThreshold = constants.animations.velocity
      ? (dragY.value <= 20 && velocityY >= constants.animations.velocity) || thresholdProps
      : thresholdProps;

    runOnJS(setEnableBounces)(false);
    runOnJS(setDisableScroll)(true);

    if (closeThreshold) {
      runOnJS(handleClose)();
    } else {
      translateY.value = withSpring(0, constants.springConfig);
    }
  };

  useEffect(() => {
    return () => {
      handleClearBackButtonListener();
    };
  }, []);

  return (
    <InternalLogicContext.Provider
      value={{
        // Animations
        translateY,
        cancelTranslateY,
        componentTranslateY,
        dragY,
        beginDragY,
        reverseDragY,
        overlay,

        // Derived
        derivedTranslateY,

        // Variables
        isHandleOutside,
        handleHeight,
        fullHeight,
        computedHeight,
        endHeight,
        adjustValue,
        snaps,

        // States
        modalHeightValue,
        setModalHeightValue,
        lastSnap,
        setLastSnap,
        isVisible,
        setIsVisible,
        showContent,
        setShowContent,
        enableBounces,
        setEnableBounces,
        keyboardToggle,
        setKeyboardToggle,
        keyboardHeight,
        setKeyboardHeight,
        disableScroll,
        setDisableScroll,
        modalPosition,
        setModalPosition,
        cancelClose,
        setCancelClose,
        layouts,
        setLayouts,
        willCloseModalize,

        // Methods
        handleGestureUpdate,
        handleGestureEnd,
        handleOpen,
        handleClose,

        // deprecated
        deprecated__handleChildren,
        deprecated__handleGestureEvent,
      }}
    >
      {children}
    </InternalLogicContext.Provider>
  );
};

export const useInternalLogic = () => useContext(InternalLogicContext);
