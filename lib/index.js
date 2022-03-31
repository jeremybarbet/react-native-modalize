"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modalize = void 0;
/**
 * esModuleInterop: true looks to work everywhere except
 * on snack.expo for some reason. Will revisit this later.
 */
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const use_dimensions_1 = require("./utils/use-dimensions");
const get_spring_config_1 = require("./utils/get-spring-config");
const devices_1 = require("./utils/devices");
const libraries_1 = require("./utils/libraries");
const invariant_1 = require("./utils/invariant");
const compose_refs_1 = require("./utils/compose-refs");
const styles_1 = __importDefault(require("./styles"));
const AnimatedKeyboardAvoidingView = react_native_1.Animated.createAnimatedComponent(react_native_1.KeyboardAvoidingView);
/**
 * When scrolling, it happens than beginScrollYValue is not always equal to 0 (top of the ScrollView).
 * Since we use this to trigger the swipe down gesture animation, we allow a small threshold to
 * not dismiss Modalize when we are using the ScrollView and we don't want to dismiss.
 */
const SCROLL_THRESHOLD = -4;
const USE_NATIVE_DRIVER = true;
const ACTIVATED = 20;
const PAN_DURATION = 150;
const ModalizeBase = ({ 
// Refs
contentRef, 
// Renderers
children, scrollViewProps, flatListProps, sectionListProps, customRenderer, 
// Styles
rootStyle, modalStyle, handleStyle, overlayStyle, childrenStyle, 
// Layout
snapPoint, modalHeight, modalTopOffset = react_native_1.Platform.select({
    ios: 0,
    android: react_native_1.StatusBar.currentHeight || 0,
    default: 0,
}), alwaysOpen, adjustToContentHeight = false, 
// Options
handlePosition = 'outside', disableScrollIfPossible = true, avoidKeyboardLikeIOS = react_native_1.Platform.select({
    ios: true,
    android: false,
    default: true,
}), keyboardAvoidingBehavior = 'padding', keyboardAvoidingOffset, panGestureEnabled = true, tapGestureEnabled = true, closeOnOverlayTap = true, closeSnapPointStraightEnabled = true, 
// Animations
openAnimationConfig = {
    timing: { duration: 240, easing: react_native_1.Easing.ease },
    spring: { speed: 14, bounciness: 4 },
}, closeAnimationConfig = {
    timing: { duration: 240, easing: react_native_1.Easing.ease },
}, dragToss = 0.18, threshold = 120, velocity = 2800, panGestureAnimatedValue, useNativeDriver = true, 
// Elements visibilities
withReactModal = false, reactModalProps, withHandle = true, withOverlay = true, 
// Additional components
HeaderComponent, FooterComponent, FloatingComponent, 
// Callbacks
onOpen, onOpened, onClose, onClosed, onBackButtonPress, onPositionChange, onOverlayPress, onLayout, }, ref) => {
    const { height: screenHeight } = use_dimensions_1.useDimensions();
    const isHandleOutside = handlePosition === 'outside';
    const handleHeight = withHandle ? 20 : isHandleOutside ? 35 : 20;
    const fullHeight = screenHeight - modalTopOffset;
    const computedHeight = fullHeight - handleHeight - (devices_1.isIphoneX ? 34 : 0);
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
    const [disableScroll, setDisableScroll] = React.useState(alwaysOpen || snapPoint ? true : undefined);
    const [beginScrollYValue, setBeginScrollYValue] = React.useState(0);
    const [modalPosition, setModalPosition] = React.useState('initial');
    const [cancelClose, setCancelClose] = React.useState(false);
    const [layouts, setLayouts] = React.useState(new Map());
    const cancelTranslateY = React.useRef(new react_native_1.Animated.Value(1)).current; // 1 by default to have the translateY animation running
    const componentTranslateY = React.useRef(new react_native_1.Animated.Value(0)).current;
    const overlay = React.useRef(new react_native_1.Animated.Value(0)).current;
    const beginScrollY = React.useRef(new react_native_1.Animated.Value(0)).current;
    const dragY = React.useRef(new react_native_1.Animated.Value(0)).current;
    const translateY = React.useRef(new react_native_1.Animated.Value(screenHeight)).current;
    const reverseBeginScrollY = React.useRef(react_native_1.Animated.multiply(new react_native_1.Animated.Value(-1), beginScrollY))
        .current;
    const tapGestureModalizeRef = React.useRef(null);
    const panGestureChildrenRef = React.useRef(null);
    const nativeViewChildrenRef = React.useRef(null);
    const contentViewRef = React.useRef(null);
    const tapGestureOverlayRef = React.useRef(null);
    const backButtonListenerRef = React.useRef(null);
    // We diff and get the negative value only. It sometimes go above 0
    // (e.g. 1.5) and creates the flickering on Modalize for a ms
    const diffClamp = react_native_1.Animated.diffClamp(reverseBeginScrollY, -screenHeight, 0);
    const componentDragEnabled = componentTranslateY._value === 1;
    // When we have a scrolling happening in the ScrollView, we don't want to translate
    // the modal down. We either multiply by 0 to cancel the animation, or 1 to proceed.
    const dragValue = react_native_1.Animated.add(react_native_1.Animated.multiply(dragY, componentDragEnabled ? 1 : cancelTranslateY), diffClamp);
    const value = react_native_1.Animated.add(react_native_1.Animated.multiply(translateY, componentDragEnabled ? 1 : cancelTranslateY), dragValue);
    let willCloseModalize = false;
    const handleBackPress = () => {
        if (alwaysOpen) {
            return false;
        }
        if (onBackButtonPress) {
            return onBackButtonPress();
        }
        else {
            handleClose();
        }
        return true;
    };
    const handleKeyboardShow = (event) => {
        const { height } = event.endCoordinates;
        setKeyboardToggle(true);
        setKeyboardHeight(height);
    };
    const handleKeyboardHide = () => {
        setKeyboardToggle(false);
        setKeyboardHeight(0);
    };
    const handleAnimateOpen = (alwaysOpenValue, dest = 'default') => {
        const { timing, spring } = openAnimationConfig;
        backButtonListenerRef.current = react_native_1.BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        let toValue = 0;
        let toPanValue = 0;
        let newPosition;
        if (dest === 'top') {
            toValue = 0;
        }
        else if (alwaysOpenValue) {
            toValue = (modalHeightValue || 0) - alwaysOpenValue;
        }
        else if (snapPoint) {
            toValue = (modalHeightValue || 0) - snapPoint;
        }
        if (panGestureAnimatedValue && (alwaysOpenValue || snapPoint)) {
            toPanValue = 0;
        }
        else if (panGestureAnimatedValue &&
            !alwaysOpenValue &&
            (dest === 'top' || dest === 'default')) {
            toPanValue = 1;
        }
        setIsVisible(true);
        setShowContent(true);
        if ((alwaysOpenValue && dest !== 'top') || (snapPoint && dest === 'default')) {
            newPosition = 'initial';
        }
        else {
            newPosition = 'top';
        }
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(overlay, {
                toValue: alwaysOpenValue && dest === 'default' ? 0 : 1,
                duration: timing.duration,
                easing: react_native_1.Easing.ease,
                useNativeDriver: USE_NATIVE_DRIVER,
            }),
            panGestureAnimatedValue
                ? react_native_1.Animated.timing(panGestureAnimatedValue, {
                    toValue: toPanValue,
                    duration: PAN_DURATION,
                    easing: react_native_1.Easing.ease,
                    useNativeDriver,
                })
                : react_native_1.Animated.delay(0),
            spring
                ? react_native_1.Animated.spring(translateY, Object.assign(Object.assign({}, get_spring_config_1.getSpringConfig(spring)), { toValue, useNativeDriver: USE_NATIVE_DRIVER }))
                : react_native_1.Animated.timing(translateY, {
                    toValue,
                    duration: timing.duration,
                    easing: timing.easing,
                    useNativeDriver: USE_NATIVE_DRIVER,
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
    const handleAnimateClose = (dest = 'default', callback) => {
        var _a;
        const { timing, spring } = closeAnimationConfig;
        const lastSnapValue = snapPoint ? snaps[1] : 80;
        const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
        const toValue = toInitialAlwaysOpen && alwaysOpen ? (modalHeightValue || 0) - alwaysOpen : screenHeight;
        (_a = backButtonListenerRef.current) === null || _a === void 0 ? void 0 : _a.remove();
        cancelTranslateY.setValue(1);
        setBeginScrollYValue(0);
        beginScrollY.setValue(0);
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(overlay, {
                toValue: 0,
                duration: timing.duration,
                easing: react_native_1.Easing.ease,
                useNativeDriver: USE_NATIVE_DRIVER,
            }),
            panGestureAnimatedValue
                ? react_native_1.Animated.timing(panGestureAnimatedValue, {
                    toValue: 0,
                    duration: PAN_DURATION,
                    easing: react_native_1.Easing.ease,
                    useNativeDriver,
                })
                : react_native_1.Animated.delay(0),
            spring
                ? react_native_1.Animated.spring(translateY, Object.assign(Object.assign({}, get_spring_config_1.getSpringConfig(spring)), { toValue, useNativeDriver: USE_NATIVE_DRIVER }))
                : react_native_1.Animated.timing(translateY, {
                    duration: timing.duration,
                    easing: react_native_1.Easing.out(react_native_1.Easing.ease),
                    toValue,
                    useNativeDriver: USE_NATIVE_DRIVER,
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
    const handleModalizeContentLayout = ({ nativeEvent: { layout } }) => {
        const value = Math.min(layout.height + (!adjustToContentHeight || keyboardHeight ? layout.y : 0), endHeight -
            react_native_1.Platform.select({
                ios: 0,
                android: keyboardHeight,
                default: 0,
            }));
        setModalHeightValue(value);
    };
    const handleBaseLayout = (component, height) => {
        setLayouts(new Map(layouts.set(component, height)));
        const max = Array.from(layouts).reduce((acc, cur) => acc + (cur === null || cur === void 0 ? void 0 : cur[1]), 0);
        const maxFixed = +max.toFixed(3);
        const endHeightFixed = +endHeight.toFixed(3);
        const shorterHeight = maxFixed < endHeightFixed;
        setDisableScroll(shorterHeight && disableScrollIfPossible);
    };
    const handleContentLayout = ({ nativeEvent }) => {
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
    const handleComponentLayout = ({ nativeEvent }, name, absolute) => {
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
    const handleClose = (dest, callback) => {
        if (onClose) {
            onClose();
        }
        handleAnimateClose(dest, callback);
    };
    const handleChildren = ({ nativeEvent }, type) => {
        const { timing } = closeAnimationConfig;
        const { velocityY, translationY } = nativeEvent;
        const negativeReverseScroll = modalPosition === 'top' &&
            beginScrollYValue >= (snapPoint ? 0 : SCROLL_THRESHOLD) &&
            translationY < 0;
        const thresholdProps = translationY > threshold && beginScrollYValue === 0;
        const closeThreshold = velocity
            ? (beginScrollYValue <= 20 && velocityY >= velocity) || thresholdProps
            : thresholdProps;
        let enableBouncesValue = true;
        // We make sure to reset the value if we are dragging from the children
        if (type !== 'component' && cancelTranslateY._value === 0) {
            componentTranslateY.setValue(0);
        }
        /*
         * When the pan gesture began we check the position of the ScrollView "cursor".
         * We cancel the translation animation if the ScrollView is not scrolled to the top
         */
        if (nativeEvent.oldState === react_native_gesture_handler_1.State.BEGAN) {
            setCancelClose(false);
            if (!closeSnapPointStraightEnabled && snapPoint
                ? beginScrollYValue > 0
                : beginScrollYValue > 0 || negativeReverseScroll) {
                setCancelClose(true);
                translateY.setValue(0);
                dragY.setValue(0);
                cancelTranslateY.setValue(0);
                enableBouncesValue = true;
            }
            else {
                cancelTranslateY.setValue(1);
                enableBouncesValue = false;
                if (!tapGestureEnabled) {
                    setDisableScroll((Boolean(snapPoint) || Boolean(alwaysOpen)) && modalPosition === 'initial');
                }
            }
        }
        setEnableBounces(devices_1.isAndroid
            ? false
            : alwaysOpen
                ? beginScrollYValue > 0 || translationY < 0
                : enableBouncesValue);
        if (nativeEvent.oldState === react_native_gesture_handler_1.State.ACTIVE) {
            const toValue = translationY - beginScrollYValue;
            let destSnapPoint = 0;
            if (snapPoint || alwaysOpen) {
                const endOffsetY = lastSnap + toValue + dragToss * velocityY;
                /**
                 * snapPoint and alwaysOpen use both an array of points to define the first open state and the final state.
                 */
                snaps.forEach((snap) => {
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
                        }
                        else {
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
            }
            else if (closeThreshold && !alwaysOpen && !cancelClose) {
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
                react_native_1.Animated.timing(overlay, {
                    toValue: Number(destSnapPoint <= 0),
                    duration: timing.duration,
                    easing: react_native_1.Easing.ease,
                    useNativeDriver: USE_NATIVE_DRIVER,
                }).start();
            }
            react_native_1.Animated.spring(translateY, {
                tension: 50,
                friction: 12,
                velocity: velocityY,
                toValue: destSnapPoint,
                useNativeDriver: USE_NATIVE_DRIVER,
            }).start();
            if (beginScrollYValue <= 0) {
                const modalPositionValue = destSnapPoint <= 0 ? 'top' : 'initial';
                if (panGestureAnimatedValue) {
                    react_native_1.Animated.timing(panGestureAnimatedValue, {
                        toValue: Number(modalPositionValue === 'top'),
                        duration: PAN_DURATION,
                        easing: react_native_1.Easing.ease,
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
    const handleComponent = ({ nativeEvent }) => {
        // If we drag from the HeaderComponent/FooterComponent/FloatingComponent we allow the translation animation
        if (nativeEvent.oldState === react_native_gesture_handler_1.State.BEGAN) {
            componentTranslateY.setValue(1);
            beginScrollY.setValue(0);
        }
        handleChildren({ nativeEvent }, 'component');
    };
    const handleOverlay = ({ nativeEvent }) => {
        if (nativeEvent.oldState === react_native_gesture_handler_1.State.ACTIVE && !willCloseModalize) {
            if (onOverlayPress) {
                onOverlayPress();
            }
            const dest = !!alwaysOpen ? 'alwaysOpen' : 'default';
            handleClose(dest);
        }
    };
    const handleGestureEvent = react_native_1.Animated.event([{ nativeEvent: { translationY: dragY } }], {
        useNativeDriver: USE_NATIVE_DRIVER,
        listener: ({ nativeEvent: { translationY } }) => {
            var _a;
            if (panGestureAnimatedValue) {
                const offset = (_a = alwaysOpen !== null && alwaysOpen !== void 0 ? alwaysOpen : snapPoint) !== null && _a !== void 0 ? _a : 0;
                const diff = Math.abs(translationY / (endHeight - offset));
                const y = translationY <= 0 ? diff : 1 - diff;
                let value;
                if (modalPosition === 'initial' && translationY > 0) {
                    value = 0;
                }
                else if (modalPosition === 'top' && translationY <= 0) {
                    value = 1;
                }
                else {
                    value = y;
                }
                panGestureAnimatedValue.setValue(value);
            }
        },
    });
    const renderHandle = () => {
        const handleStyles = [styles_1.default.handle];
        const shapeStyles = [styles_1.default.handle__shape, handleStyle];
        if (!withHandle) {
            return null;
        }
        if (!isHandleOutside) {
            handleStyles.push(styles_1.default.handleBottom);
            shapeStyles.push(styles_1.default.handle__shapeBottom, handleStyle);
        }
        return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { enabled: panGestureEnabled, simultaneousHandlers: tapGestureModalizeRef, shouldCancelWhenOutside: false, onGestureEvent: handleGestureEvent, onHandlerStateChange: handleComponent },
            React.createElement(react_native_1.Animated.View, { style: handleStyles },
                React.createElement(react_native_1.View, { style: shapeStyles }))));
    };
    const renderElement = (Element) => typeof Element === 'function' ? Element() : Element;
    const renderComponent = (component, name) => {
        var _a;
        if (!component) {
            return null;
        }
        const tag = renderElement(component);
        /**
         * Nesting Touchable/ScrollView components with RNGH PanGestureHandler cancels the inner events.
         * Until a better solution lands in RNGH, I will disable the PanGestureHandler for Android only,
         * so inner touchable/gestures are working from the custom components you can pass in.
         */
        // if (isAndroid && !panGestureComponentEnabled) {
        //   return tag;
        // }
        const obj = react_native_1.StyleSheet.flatten((_a = tag === null || tag === void 0 ? void 0 : tag.props) === null || _a === void 0 ? void 0 : _a.style);
        const absolute = (obj === null || obj === void 0 ? void 0 : obj.position) === 'absolute';
        const zIndex = obj === null || obj === void 0 ? void 0 : obj.zIndex;
        return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { enabled: panGestureEnabled, shouldCancelWhenOutside: false, onGestureEvent: handleGestureEvent, onHandlerStateChange: handleComponent },
            React.createElement(react_native_1.Animated.View, { style: { zIndex }, onLayout: (e) => handleComponentLayout(e, name, absolute) }, tag)));
    };
    const renderContent = () => {
        var _a;
        const keyboardDismissMode = devices_1.isIos ? 'interactive' : 'on-drag';
        const passedOnProps = (_a = flatListProps !== null && flatListProps !== void 0 ? flatListProps : sectionListProps) !== null && _a !== void 0 ? _a : scrollViewProps;
        // We allow overwrites when the props (bounces, scrollEnabled) are set to false, when true we use Modalize's core behavior
        const bounces = (passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.bounces) !== undefined && !(passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.bounces)
            ? passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.bounces : enableBounces;
        const scrollEnabled = (passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.scrollEnabled) !== undefined && !(passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.scrollEnabled)
            ? passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.scrollEnabled : keyboardToggle || !disableScroll;
        const scrollEventThrottle = (passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.scrollEventThrottle) || 16;
        const onScrollBeginDrag = passedOnProps === null || passedOnProps === void 0 ? void 0 : passedOnProps.onScrollBeginDrag;
        const opts = {
            ref: compose_refs_1.composeRefs(contentViewRef, contentRef),
            bounces,
            onScrollBeginDrag: react_native_1.Animated.event([{ nativeEvent: { contentOffset: { y: beginScrollY } } }], {
                useNativeDriver: USE_NATIVE_DRIVER,
                listener: onScrollBeginDrag,
            }),
            scrollEventThrottle,
            onLayout: handleContentLayout,
            scrollEnabled,
            keyboardDismissMode,
        };
        if (flatListProps) {
            return React.createElement(react_native_1.Animated.FlatList, Object.assign({}, flatListProps, opts));
        }
        if (sectionListProps) {
            return React.createElement(react_native_1.Animated.SectionList, Object.assign({}, sectionListProps, opts));
        }
        if (customRenderer) {
            const tag = renderElement(customRenderer);
            return React.cloneElement(tag, Object.assign({}, opts));
        }
        return (React.createElement(react_native_1.Animated.ScrollView, Object.assign({}, scrollViewProps, opts), children));
    };
    const renderChildren = () => {
        const style = adjustToContentHeight ? styles_1.default.content__adjustHeight : styles_1.default.content__container;
        const minDist = libraries_1.isRNGH2() ? undefined : ACTIVATED;
        return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { ref: panGestureChildrenRef, enabled: panGestureEnabled, simultaneousHandlers: [nativeViewChildrenRef, tapGestureModalizeRef], shouldCancelWhenOutside: false, onGestureEvent: handleGestureEvent, minDist: minDist, activeOffsetY: ACTIVATED, activeOffsetX: ACTIVATED, onHandlerStateChange: handleChildren },
            React.createElement(react_native_1.Animated.View, { style: [style, childrenStyle] },
                React.createElement(react_native_gesture_handler_1.NativeViewGestureHandler, { ref: nativeViewChildrenRef, waitFor: tapGestureModalizeRef, simultaneousHandlers: panGestureChildrenRef }, renderContent()))));
    };
    const renderOverlay = () => {
        const pointerEvents = alwaysOpen && (modalPosition === 'initial' || !modalPosition) ? 'box-none' : 'auto';
        return (React.createElement(react_native_gesture_handler_1.PanGestureHandler, { enabled: panGestureEnabled, simultaneousHandlers: tapGestureModalizeRef, shouldCancelWhenOutside: false, onGestureEvent: handleGestureEvent, onHandlerStateChange: handleChildren },
            React.createElement(react_native_1.Animated.View, { style: styles_1.default.overlay, pointerEvents: pointerEvents }, showContent && (React.createElement(react_native_gesture_handler_1.TapGestureHandler, { ref: tapGestureOverlayRef, enabled: closeOnOverlayTap !== undefined ? closeOnOverlayTap : panGestureEnabled, onHandlerStateChange: handleOverlay },
                React.createElement(react_native_1.Animated.View, { style: [
                        styles_1.default.overlay__background,
                        overlayStyle,
                        {
                            opacity: overlay.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        },
                    ], pointerEvents: pointerEvents }))))));
    };
    React.useImperativeHandle(ref, () => ({
        open(dest) {
            if (onOpen) {
                onOpen();
            }
            handleAnimateOpen(alwaysOpen, dest);
        },
        close(dest, callback) {
            handleClose(dest, callback);
        },
    }));
    React.useEffect(() => {
        if (alwaysOpen && (modalHeightValue || adjustToContentHeight)) {
            handleAnimateOpen(alwaysOpen);
        }
    }, [alwaysOpen, modalHeightValue]);
    React.useEffect(() => {
        invariant_1.invariant(modalHeight && adjustToContentHeight, `You can't use both 'modalHeight' and 'adjustToContentHeight' props at the same time. Only choose one of the two.`);
        invariant_1.invariant((scrollViewProps || children) && flatListProps, `You have defined 'flatListProps' along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'flatListProps' to fix the error.`);
        invariant_1.invariant((scrollViewProps || children) && sectionListProps, `You have defined 'sectionListProps'  along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'sectionListProps' to fix the error.`);
    }, [
        modalHeight,
        adjustToContentHeight,
        scrollViewProps,
        children,
        flatListProps,
        sectionListProps,
    ]);
    React.useEffect(() => {
        setModalHeightValue(adjustValue);
    }, [adjustToContentHeight, modalHeight, screenHeight]);
    React.useEffect(() => {
        let keyboardShowListener = null;
        let keyboardHideListener = null;
        const beginScrollYListener = beginScrollY.addListener(({ value }) => setBeginScrollYValue(value));
        if (libraries_1.isBelowRN65) {
            react_native_1.Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
            react_native_1.Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
        }
        else {
            keyboardShowListener = react_native_1.Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
            keyboardHideListener = react_native_1.Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
        }
        return () => {
            var _a;
            (_a = backButtonListenerRef.current) === null || _a === void 0 ? void 0 : _a.remove();
            beginScrollY.removeListener(beginScrollYListener);
            if (libraries_1.isBelowRN65) {
                react_native_1.Keyboard.removeListener('keyboardDidShow', handleKeyboardShow);
                react_native_1.Keyboard.removeListener('keyboardDidHide', handleKeyboardHide);
            }
            else {
                keyboardShowListener === null || keyboardShowListener === void 0 ? void 0 : keyboardShowListener.remove();
                keyboardHideListener === null || keyboardHideListener === void 0 ? void 0 : keyboardHideListener.remove();
            }
        };
    }, []);
    const keyboardAvoidingViewProps = {
        keyboardVerticalOffset: keyboardAvoidingOffset,
        behavior: keyboardAvoidingBehavior,
        enabled: avoidKeyboardLikeIOS,
        style: [
            styles_1.default.modalize__content,
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
    const renderModalize = (React.createElement(react_native_1.View, { style: [styles_1.default.modalize, rootStyle], pointerEvents: alwaysOpen || !withOverlay ? 'box-none' : 'auto' },
        React.createElement(react_native_gesture_handler_1.TapGestureHandler, { ref: tapGestureModalizeRef, maxDurationMs: tapGestureEnabled ? 100000 : 50, maxDeltaY: lastSnap, enabled: panGestureEnabled },
            React.createElement(react_native_1.View, { style: styles_1.default.modalize__wrapper, pointerEvents: "box-none" },
                showContent && (React.createElement(AnimatedKeyboardAvoidingView, Object.assign({}, keyboardAvoidingViewProps),
                    renderHandle(),
                    renderComponent(HeaderComponent, 'header'),
                    renderChildren(),
                    renderComponent(FooterComponent, 'footer'))),
                withOverlay && renderOverlay())),
        renderComponent(FloatingComponent, 'floating')));
    const renderReactModal = (child) => (React.createElement(react_native_1.Modal, Object.assign({}, reactModalProps, { supportedOrientations: ['landscape', 'portrait', 'portrait-upside-down'], onRequestClose: handleBackPress, hardwareAccelerated: USE_NATIVE_DRIVER, visible: isVisible, transparent: true }),
        React.createElement(react_native_gesture_handler_1.GestureHandlerRootView, { style: { flex: 1 } }, child)));
    if (!isVisible) {
        return null;
    }
    if (withReactModal) {
        return renderReactModal(renderModalize);
    }
    return renderModalize;
};
exports.Modalize = React.forwardRef(ModalizeBase);
