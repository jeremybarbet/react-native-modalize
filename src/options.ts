import { ReactNode, RefObject } from 'react';
import {
  FlatList,
  FlatListProps,
  LayoutRectangle,
  ScrollView,
  ScrollViewProps,
  SectionListProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { AnimateProps, SharedValue } from 'react-native-reanimated';

/**
 * These props are required by the internal logic of Modalize and cannot be used.
 */
type OmittedProps<T> = Omit<T, 'onScrollBeginDrag' | 'scrollEventThrottle'>;

export type ListItem = any;
export type ListSection = any;
export type Open = 'default' | 'top';
export type Close = 'default' | 'alwaysOpen';
export type Position = 'initial' | 'top';
export type Style = StyleProp<ViewStyle>;

export type ScrollViewType = AnimateProps<OmittedProps<ScrollViewProps>>;
export type FlatListType<T> = AnimateProps<OmittedProps<FlatListProps<T>>>;
export type SectionListType<T, K> = AnimateProps<OmittedProps<SectionListProps<T, K>>>;

export type RendererType<T, K> =
  | AnimateProps<ScrollView>
  | AnimateProps<FlatList<T>>
  | AnimateProps<SectionListProps<T, K>>;

export interface Props<T = ListItem, K = ListSection> {
  /**
   * A reference to the renderer (ScrollView, FlatList, SectionList) that provides the scroll behavior, where you will be able to access their owns methods.
   */
  rendererRef?: RefObject<RendererType<T, K>>;

  /**
   * A React node that will define the content of the modal.
   */
  children?: ReactNode;

  /**
   * An object to pass any of the react-native ScrollView's props.
   */
  scrollViewProps?: ScrollViewType;

  /**
   * An object to pass any of the react-native FlatList's props.
   */
  flatListProps?: FlatListType<T>;

  /**
   * An object to pass any of the react-native SectionList's props.
   */
  sectionListProps?: SectionListType<T, K>;

  /**
   * Define the style of the root modal component.
   */
  rootStyle?: Style;

  /**
   * Define the style of the modal (includes handle/header/children/footer).
   */
  modalStyle?: Style;

  /**
   * Define the style of the handle on top of the modal.
   */
  handleStyle?: Style;

  /**
   * Define the style of the overlay.
   */
  overlayStyle?: Style;

  /**
   * Define the style of the children renderer (only the inside part).
   */
  childrenStyle?: Style;

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
   * Animated.Value of the modal position between 0 and 1.
   */
  panGestureAnimatedValue?: SharedValue<number>;

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
  HeaderComponent?: ReactNode;

  /**
   * A footer component outside of the ScrollView, on top of the modal.
   */
  FooterComponent?: ReactNode;

  /**
   * A floating component inside the modal wrapper that will be independent of scrolling. It requires `zIndex` child with absolute positioning.
   */
  FloatingComponent?: ReactNode;

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
  onLayout?(nativeEvent: { layout: LayoutRectangle }): void;
}

export interface Handles {
  /**
   * Method to open Modalize.
   *
   * If you are using `snapPoint` prop, you can supply a `dest` argument to the `open` method, to open it
   * to the top directly `open('top')`. You don't have to provide anything if you want the default behavior.
   */
  open(dest?: Open): void;

  /**
   * The method to close Modalize. You don't need to call it to dismiss the modal, since you can swipe down to dismiss.
   *
   * If you are using `alwaysOpen` prop, you can supply a `dest` argument to the `close` method to reset it
   * to the initial position `close('alwaysOpen')`, and avoiding to close it completely.
   */
  close(dest?: Close, callback?: () => void): void;
}
