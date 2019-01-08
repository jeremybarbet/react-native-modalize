import { Animated, ViewStyle, RegisteredStyle, ScrollViewProps, FlatListProps, SectionListProps } from 'react-native';

export interface IProps {
  /**
   * A React component that will define the content of the modal.
   */
  children: React.ReactNode;

  /**
   * A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.
   */
  height?: number;

  /**
   * Define where the handle on top of the modal should be positioned.
   * @default 'outside'
   */
  handlePosition: 'outside' | 'inside';

  /**
   * Define the style of the modal.
   */
  style?: ViewStyle | ViewStyle[] | RegisteredStyle<ViewStyle> | RegisteredStyle<ViewStyle[]>;

  /**
   * Define the style of the handle on top of the modal.
   */
  handleStyle?: ViewStyle | ViewStyle[] | RegisteredStyle<ViewStyle> | RegisteredStyle<ViewStyle[]>;

  /**
   * Define the style of the overlay.
   */
  overlayStyle?: ViewStyle | ViewStyle[] | RegisteredStyle<ViewStyle> | RegisteredStyle<ViewStyle[]>;

  /**
   * Use the native thread to execute the animations.
   * @default true
   */
  useNativeDriver?: boolean;

  /**
   * Shrink the modal to your content's height.
   * @default false
   */
  adjustToContentHeight?: boolean;

  /**
   * Define if you want to toggle the vertical scroll indicator.
   * @default false
   */
  showsVerticalScrollIndicator?: boolean;

  /**
   * Define the behavior of the keyboard when having inputs inside the modal.
   * @default 'never'
   */
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';

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
   * An object to pass any of the react-native scrollView's props.
   */
  scrollViewProps: ScrollViewProps;

  /*
   * An object to pass any of the react-native flatList's props.
   */
  flatListProps: FlatListProps<any>;

  /*
   * An object to pass any of the react-native sectionList's props.
   */
  sectionListProps: SectionListProps<any>;

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
  modalHeight: number;

  /**
   * Calculate the content's height. Used when `adjustToContentHeight: true`.
   */
  contentHeight: number;

  /**
   * Calculate the header's height. Used when `header` props is defined.
   */
  headerHeight: number;

  /**
   * Calculate the footer's height. Used when `footer` props is defined.
   */
  footerHeight: number;

  /**
   * When we scroll to the bottom of the ScrollView we want the bounce animation but when we reach the top again, we want it disabled. (iOS specific)
   */
  enableBounces: boolean;

  /**
   * Define the ScrollView height. If `header` or `footer` are passed and are not `position: 'absolute'`, theirs heights will be substracted to the ScrollView's height.
   */
  scrollViewHeight: ViewStyle[];

  /**
   * Define the scroll has to be enable or not depending of the keyboard status.
   */
  keyboardEnableScroll: boolean;

  /**
   * Store if the keyboard is displayed. Used to change the offset on the scrollview when the keyboard is open.
   */
  keyboardToggle: boolean;
}
