import * as React from 'react';
import { Animated, ViewStyle, ScrollViewProps, FlatListProps, SectionListProps, EasingFunction, LayoutRectangle, ScrollView, FlatList, SectionList, StyleProp, ModalProps } from 'react-native';
export declare type TOpen = 'default' | 'top';
export declare type TClose = 'default' | 'alwaysOpen';
export declare type TPosition = 'initial' | 'top';
export declare type TStyle = StyleProp<ViewStyle>;
export interface ITimingProps {
    duration: number;
    easing?: EasingFunction;
    delay?: number;
    isInteraction?: boolean;
}
export interface ISpringProps {
    friction?: number;
    tension?: number;
    speed?: number;
    bounciness?: number;
    stiffness?: number;
    damping?: number;
    mass?: number;
}
export interface IConfigProps {
    timing: ITimingProps;
    spring?: ISpringProps;
}
export interface IProps<ListItem = any> {
    /**
     * A reference to the view (ScrollView, FlatList, SectionList) that provides the scroll behavior, where you will be able to access their owns methods.
     */
    contentRef?: React.RefObject<ScrollView | FlatList<ListItem> | SectionList<ListItem>>;
    /**
     * A React node that will define the content of the modal.
     */
    children?: React.ReactNode;
    /**
     * An object to pass any of the react-native ScrollView's props.
     */
    scrollViewProps?: Animated.AnimatedProps<ScrollViewProps>;
    /**
     * An object to pass any of the react-native FlatList's props.
     */
    flatListProps?: Animated.AnimatedProps<FlatListProps<ListItem>>;
    /**
     * An object to pass any of the react-native SectionList's props.
     */
    sectionListProps?: Animated.AnimatedProps<SectionListProps<ListItem>>;
    /**
     * An animated custom JSX Element that will inherits of the onScroll/gesture events
     */
    customRenderer?: JSX.Element;
    /**
     * Define the style of the root modal component.
     */
    rootStyle?: TStyle;
    /**
     * Define the style of the modal (includes handle/header/children/footer).
     */
    modalStyle?: TStyle;
    /**
     * Define the style of the handle on top of the modal.
     */
    handleStyle?: TStyle;
    /**
     * Define the style of the overlay.
     */
    overlayStyle?: TStyle;
    /**
     * Define the style of the children renderer (only the inside part).
     */
    childrenStyle?: TStyle;
    /**
     * A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.
     */
    snapPoint?: number;
    /**
     * A number to define the modal's total height.
     */
    modalHeight?: number;
    /**
     * A number to define the modal's top offset.
     */
    modalTopOffset?: number;
    /**
     * Using this props will show the modal all the time, and the number represents how expanded the modal has to be.
     */
    alwaysOpen?: number;
    /**
     * Shrink the modal to your content's height.
     * @default false
     */
    adjustToContentHeight?: boolean;
    /**
     * Define where the handle on top of the modal should be positioned.
     * @default 'outside'
     */
    handlePosition?: 'outside' | 'inside';
    /**
     * Disable the scroll when the content is shorter than screen's height.
     * @default true
     */
    disableScrollIfPossible?: boolean;
    /**
     * Define keyboard's Android behavior like iOS's one.
     * @default Platform.select({ ios: true, android: false })
     */
    avoidKeyboardLikeIOS?: boolean;
    /**
     * Define the behavior of the keyboard when having inputs inside the modal.
     * @default padding
     */
    keyboardAvoidingBehavior?: 'height' | 'position' | 'padding';
    /**
     * Define an offset to the KeyboardAvoidingView component wrapping the ScrollView.
     * @default 0
     */
    keyboardAvoidingOffset?: number;
    /**
     * Using this prop will enable/disable pan gesture.
     * @default true
     */
    panGestureEnabled?: boolean;
    /**
     * Define if HeaderComponent/FooterComponent/FloatingComponent should have pan gesture enable (Android specific). When enable it might break touchable inside the view.
     * @default false
     */
    panGestureComponentEnabled?: boolean;
    /**
     * Define if the `TapGestureHandler` wrapping Modalize's core should be enable or not.
     * @default true
     */
    tapGestureEnabled?: boolean;
    /**
     * Using this prop will enable/disable overlay tap gesture.
     * @default true
     */
    closeOnOverlayTap?: boolean;
    /**
     * Define if `snapPoint` props should close straight when swiping down or come back to initial position.
     * @default true
     */
    closeSnapPointStraightEnabled?: boolean;
    /**
     * Object to change the open animations.
     * @default
     * {
     * timing: { duration: 280 },
     * spring: { speed: 14, bounciness: 5 }
     * }
     */
    openAnimationConfig?: IConfigProps;
    /**
     * Object to change the close animations.
     * @default
     * {
     * timing: { duration: 280 },
     * spring: { speed: 14, bounciness: 5 }
     * }
     */
    closeAnimationConfig?: IConfigProps;
    /**
     * A number that determines the momentum of the scroll required.
     * @default 0.05
     */
    dragToss?: number;
    /**
     * Number of pixels that the user must pass to be able to close the modal.
     * @default 120
     */
    threshold?: number;
    /**
     * Number of pixels the user has to pan down fast to close the modal.
     * @default 2800
     */
    velocity?: number | undefined;
    /**
     * Animated.Value of the modal position between 0 and 1.
     */
    panGestureAnimatedValue?: Animated.Value;
    /**
     * Define if the Animated.Value uses the native thread to execute the animations.
     * @default true
     */
    useNativeDriver?: boolean;
    /**
     * Define if Modalize has to be wrap with the Modal component from react-native.
     * @default false
     */
    withReactModal?: boolean;
    /**
     * Props for the react-native Modal wrapping Modalize
     */
    reactModalProps?: ModalProps;
    /**
     * Define if the handle on top of the modal is display or not.
     * @default true
     */
    withHandle?: boolean;
    /**
     * Define if the overlay is display or not.
     * @default true
     */
    withOverlay?: boolean;
    /**
     * A header component outside of the ScrollView, on top of the modal.
     */
    HeaderComponent?: React.ReactNode;
    /**
     * A footer component outside of the ScrollView, on top of the modal.
     */
    FooterComponent?: React.ReactNode;
    /**
     * A floating component inside the modal wrapper that will be independent of scrolling. It requires `zIndex` child with absolute positioning.
     */
    FloatingComponent?: React.ReactNode;
    /**
     * Callback function when the `open` method is triggered.
     */
    onOpen?(): void;
    /**
     * Callback function when the modal is opened.
     */
    onOpened?(): void;
    /**
     * Callback function when the `close` method is triggered.
     */
    onClose?(): void;
    /**
     * Callback function when the modal is closed.
     */
    onClosed?(): void;
    /**
     * onBackButtonPress is called when the user taps the hardware back button on
     * Android or the menu button on Apple TV. You can any function you want,
     * but you will have to close the modal by yourself.
     */
    onBackButtonPress?(): boolean;
    /**
     * Callback function which determines if the modal has reached the top
     * i.e. completely opened to modal/screen height, or is at the initial
     * point (snapPoint or alwaysOpened height).
     */
    onPositionChange?: (position: 'top' | 'initial') => void;
    /**
     * Callback used when you press the overlay.
     */
    onOverlayPress?(): void;
    /**
     * Callback used when you press the overlay.
     */
    onLayout?(nativeEvent: {
        layout: LayoutRectangle;
    }): void;
}
export interface IHandles {
    /**
     * Method to open Modalize.
     *
     * If you are using `snapPoint` prop, you can supply a `dest` argument to the `open` method, to open it
     * to the top directly `open('top')`. You don't have to provide anything if you want the default behavior.
     */
    open(dest?: TOpen): void;
    /**
     * The method to close Modalize. You don't need to call it to dismiss the modal, since you can swipe down to dismiss.
     *
     * If you are using `alwaysOpen` prop, you can supply a `dest` argument to the `close` method to reset it
     * to the initial position `close('alwaysOpen')`, and avoiding to close it completely.
     */
    close(dest?: TClose): void;
}
