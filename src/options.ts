import { Animated, ViewStyle, RegisteredStyle, EasingFunction } from 'react-native';

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

export interface IProps {
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
  onOpen?: () => void;

  /**
   * Callback function when the modal is opened.
   */
  onOpened?: () => void;

  /**
   * Callback function when the `close` method is triggered.
   */
  onClose?: () => void;

  /**
   * Callback function when the modal is closed.
   */
  onClosed?: () => void;

  /**
   * onBackButtonPress is called when the user taps the hardware back button on
   * Android or the menu button on Apple TV. You can any function you want,
   * but you will have to close the modal by yourself.
   */
  onBackButtonPress?: () => void;

  /**
   * Callback function which determines if the modal has reached the top
   * i.e. completely opened to modal/screen height, or is at the initial
   * point (snapPoint or alwaysOpened height)
   */
  onPositionChange?: (position: 'top' | 'initial') => void;
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
   * Store if the keyboard is displayed. Used to change the offset on the ContentView when the keyboard is open.
   */
  keyboardToggle: boolean;

  /**
   * Store height of the keyboard.
   */
  keyboardHeight: number;
}
