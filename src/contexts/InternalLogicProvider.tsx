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
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useInternalProps } from '../contexts/InternalPropsProvider';
import { Close, Open, Position } from '../options';
import { constants } from '../utils/constants';
import { isIphoneX } from '../utils/platform';
import { clamp } from '../worklets/clamp';

interface InternalLogicContextProps {
  // Animations
  cancelTranslateY: SharedValue<number>;
  componentTranslateY: SharedValue<number>;
  overlay: SharedValue<number>;
  beginScrollY: SharedValue<number>;
  dragY: SharedValue<number>;
  translateY: SharedValue<number>;
  reverseBeginScrollY: SharedValue<number>;
  diffClamp: Readonly<SharedValue<number>>;
  componentDragEnabled: boolean;
  dragValue: Readonly<SharedValue<number>>;
  computedTranslateY: Readonly<SharedValue<number>>;

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
  handleAnimateOpen(alwaysOpenValue: number | undefined, dest?: Open): void;
  handleAnimateClose(dest: Close, callback?: () => void): void;
  handleClose(dest?: Close, callback?: () => void): void;
}

const InternalLogicContext = createContext<InternalLogicContextProps>(
  {} as InternalLogicContextProps,
);

export const InternalLogicProvider: FC = ({ children }) => {
  const { height: screenHeight } = useWindowDimensions();

  const {
    snapPoints,
    modalHeight,
    modalTopOffset,
    alwaysOpen,
    adjustToContentHeight,
    handlePosition,
    withHandle,
    panGestureAnimatedValue,
    onOpened,
    onClose,
    onClosed,
    onPositionChange,
    onBackButtonPress,
  } = useInternalProps();

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

  const isHandleOutside = handlePosition === 'outside';
  const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
  const fullHeight = screenHeight - (modalTopOffset as number);
  const computedHeight = fullHeight - handleHeight - (isIphoneX ? 34 : 0);
  const endHeight = Math.max(0, modalHeight || computedHeight);
  const adjustValue = adjustToContentHeight ? undefined : endHeight;
  const snaps = snapPoints ? [0, ...snapPoints, endHeight] : [0, endHeight];

  const [modalHeightValue, setModalHeightValue] = useState(adjustValue);
  const [lastSnap, setLastSnap] = useState(snapPoints ? snapPoints[snapPoints.length - 1] : 0);
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const [enableBounces, setEnableBounces] = useState(true);
  const [keyboardToggle, setKeyboardToggle] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [disableScroll, setDisableScroll] = useState(alwaysOpen || snapPoints ? true : undefined);
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
    () => translateY.value * (componentDragEnabled ? 1 : cancelTranslateY.value) + dragValue.value,
    [translateY, componentDragEnabled, cancelTranslateY, dragValue],
  );

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
    } else if (snapPoints) {
      toValue = (modalHeightValue || 0) - snapPoints[0];
    }

    if (panGestureAnimatedValue && (alwaysOpenValue || snapPoints)) {
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

    if ((alwaysOpenValue && dest !== 'top') || (snapPoints && dest === 'default')) {
      newPosition = 'initial';
    } else {
      newPosition = 'top';
    }

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
    const lastSnapValue = snapPoints ? snaps[snaps.length - 1] : 80;
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
      willCloseModalize.current = false;
      setLastSnap(lastSnapValue);
      setIsVisible(toInitialAlwaysOpen);
    };

    translateY.value = withSpring(toValue, constants.springConfig, isFinished => {
      if (isFinished) {
        runOnJS(handleFinish)();
      }
    });
  };

  const handleClose = (dest?: Close, callback?: () => void) => {
    onClose?.();
    handleAnimateClose(dest, callback);
  };

  useEffect(() => {
    return () => {
      backButtonListenerRef.current?.remove();
    };
  }, []);

  return (
    <InternalLogicContext.Provider
      value={{
        // Animations
        cancelTranslateY,
        componentTranslateY,
        overlay,
        beginScrollY,
        dragY,
        translateY,
        reverseBeginScrollY,
        diffClamp,
        componentDragEnabled,
        dragValue,
        computedTranslateY,

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
        handleAnimateOpen,
        handleAnimateClose,
        handleClose,
      }}
    >
      {children}
    </InternalLogicContext.Provider>
  );
};

export const useInternalLogic = () => useContext(InternalLogicContext);
