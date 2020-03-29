import {
  Animated,
  ViewStyle,
  RegisteredStyle,
  ScrollViewProps,
  FlatListProps,
  SectionListProps,
  EasingFunction,
  LayoutRectangle,
} from 'react-native';

export type TOpen = 'default' | 'top';
export type TClose = 'default' | 'alwaysOpen';

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
  spring: ISpringProps;
}

export interface IProps<FlatListItem = any, SectionListItem = any> {
  /**
   * A React component that will define the content of the modal.
   */
  children?: React.ReactNode;

  /**
   * A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.
   */
  snapPoint?: number;

  /**
   * A number to define the modal's total height
   */
  modalHeight?: number;

  /**
   * A number to define the modal's top offset
   */
  modalTopOffset?: number;

  /**
   * Using this props will show the modal all the time, and the number represents how expanded the modal has to be
   */
  alwaysOpen?: number;

  /**
   * Define where the handle on top of the modal should be positioned.
   * @default 'outside'
   */
  handlePosition: 'outside' | 'inside';

  /**
   * A number to define the elevation of the modal on Android. Useful if you have other elements of your app using other values of elevation. (Android specific)
   */
  modalElevation?: number;

  /**
   * Define the style of the modal.
   */
  modalStyle?: ViewStyle | ViewStyle[] | RegisteredStyle<ViewStyle> | RegisteredStyle<ViewStyle[]>;

  /**
   * Define the style of the handle on top of the modal.
   */
  handleStyle?: ViewStyle | ViewStyle[] | RegisteredStyle<ViewStyle> | RegisteredStyle<ViewStyle[]>;

  /**
   * Define the style of the overlay.
   */
  overlayStyle?:
    | ViewStyle
    | ViewStyle[]
    | RegisteredStyle<ViewStyle>
    | RegisteredStyle<ViewStyle[]>;

  /**
   * Use the native thread to execute the animations.
   * @default true
   */
  useNativeDriver?: boolean;

  /**
   * Object to change the open animations
   * @default
   * {
   * timing: { duration: 280 },
   * spring: { speed: 14, bounciness: 5 }
   * }
   */
  openAnimationConfig?: IConfigProps;

  /**
   * Object to change the close animations
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
  dragToss: number;

  /**
   * Shrink the modal to your content's height.
   * @default false
   */
  adjustToContentHeight?: boolean;

  /**
   * Disable the scroll when the content is shorter than screen's height.
   * @default true
   */
  disableScrollIfPossible: boolean;

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
   * KeyboardAvoidingView.keyboardVerticalOffset
   * @default 0
   */
  keyboardAvoidingOffset?: number;

  /**
   * Using this prop will enable/disable pan gesture
   * @default true
   */
  panGestureEnabled?: boolean;

  /**
   * Animated.Value of the modal position between 0 and 1
   */
  panGestureAnimatedValue?: Animated.Value;

  /**
   * Using this prop will enable/disable overlay tap gesture
   * @default true
   */
  closeOnOverlayTap?: boolean;

  /**
   * Define if Modalize has to be wrap with the Modal component from react-native. (iOS specific)
   * @default false
   */
  withReactModal?: boolean;

  /**
   * Define if the handle on top of the modal is display or not.
   * @default true
   */
  withHandle?: boolean;

  /*
   * An object to pass any of the react-native ScrollView's props.
   */
  scrollViewProps?: Animated.AnimatedProps<ScrollViewProps>;

  /*
   * An object to pass any of the react-native FlatList's props.
   */
  flatListProps?: Animated.AnimatedProps<FlatListProps<FlatListItem>>;

  /*
   * An object to pass any of the react-native SectionList's props.
   */
  sectionListProps?: Animated.AnimatedProps<SectionListProps<SectionListItem>>;

  /*
   * A floating component inside the modal wrapper that will be independent of scrolling. It requires `zIndex` child with absolute positioning.
   */
  FloatingComponent?: React.ReactNode;

  /**
   * A header component outside of the ScrollView, on top of the modal.
   */
  HeaderComponent?: React.ReactNode;

  /**
   * A footer component outside of the ScrollView, on top of the modal.
   */
  FooterComponent?: React.ReactNode;

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
   * point (snapPoint or alwaysOpened height)
   */
  onPositionChange?: (position: 'top' | 'initial') => void;

  /**
   * Callback used when you press the overlay.
   */
  onOverlayPress?(): void;

  /**
   * Callback used when you press the overlay.
   */
  onLayout?(nativeEvent: { layout: LayoutRectangle }): void;
}

export interface IState {
  /**
   * Define the last snap value for the modal's translation.
   */
  lastSnap: number;

  /**
   * Store if the modal is open or not.
   */
  isVisible: boolean;

  /**
   * During the closing animation we hide the content to avoid jumping/blink issues while using `withReactModal: true`.
   */
  showContent: boolean;

  /**
   * Animated value controlling the overlay animation.
   */
  overlay: Animated.Value;

  /**
   * Store the height of the modal. Depends on the `height` props and devices' height.
   */
  modalHeight: number | undefined;

  /**
   * Calculate the content's height. Used when `adjustToContentHeight: true`.
   */
  contentHeight: number;

  /**
   * When we scroll to the bottom of the ContentView we want the bounce animation but when we reach the top again, we want it disabled. (iOS specific)
   */
  enableBounces: boolean;

  /**
   * Disable scroll if disableScrollIfPossible is true or if we are the initial position of the snapPoint or alwaysOpen modals
   */
  disableScroll: boolean | undefined;

  /**
   * Store if the keyboard is displayed. Used to change the offset on the ContentView when the keyboard is open.
   */
  keyboardToggle: boolean;

  /**
   * Store height of the keyboard.
   */
  keyboardHeight: number;

  /**
   * Store if the modal is using adjustToContentHeight props
   */
  adjust: boolean | undefined;
}
