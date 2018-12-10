import * as React from 'react';
import { Animated, StyleSheet, View, Platform, ViewStyle, Dimensions, Modal, Easing, LayoutChangeEvent, StyleProp, BackHandler, KeyboardAvoidingView, Keyboard, NativeModules } from 'react-native';
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler, PanGestureHandlerStateChangeEvent, TapGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

import s from './Modalize.styles';

interface IProps {
  children: React.ReactNode;
  handlePosition: 'outside' | 'inside';
  height?: number;
  style?: ViewStyle | ViewStyle[];
  handleStyle?: ViewStyle | ViewStyle[];
  overlayStyle?: ViewStyle | ViewStyle[];
  onOpen?: () => void;
  onOpened?: () => void;
  onClose?: () => void;
  onClosed?: () => void;
  useNativeDriver?: boolean;
  adjustToContentHeight?: boolean;
  showsVerticalScrollIndicator?: boolean;
  withReactModal?: boolean;
  withHandle?: boolean;
  HeaderComponent?: React.ReactNode;
  FooterComponent?: React.ReactNode;
}

interface IState {
  lastSnap: number;
  isVisible: boolean;
  showContent: boolean;
  overlay: Animated.Value;
  modalHeight: number;
  contentHeight: number;
  headerHeight: number;
  footerHeight: number;
  enableBounces: boolean;
  scrollViewHeight: ViewStyle[];
  keyboardEnableScroll: boolean;
  keyboardToggle: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const { StatusBarManager } = NativeModules;
const THRESHOLD = 150;

export default class Modalize extends React.Component<IProps, IState> {

  private snaps: number[] = [];
  private snapEnd: number;
  private beginScrollYValue: number = 0;
  private contentAlreadyCalculated: boolean = false;
  private beginScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseBeginScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalScrollView: React.RefObject<NativeViewGestureHandler> = React.createRef();
  private modalOverlay: React.RefObject<PanGestureHandler> = React.createRef();
  private modalOverlayTap: React.RefObject<TapGestureHandler> = React.createRef();
  private willCloseModalize: boolean = false;

  static defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    showsVerticalScrollIndicator: false,
    withReactModal: false,
    withHandle: true,
  };

  constructor(props: IProps) {
    super(props);

    const height = this.isIos ? screenHeight : screenHeight - 10;
    const modalHeight = height - this.handleHeight - (this.isIphoneX ? 34 : 0);

    if (props.withReactModal) {
      console.warn('[react-native-modalize] `withReactModal: true`. React modal is going to be moved out of react-native core in the future. I\'d recommend migrating to something like react-navigation or react-native-navigation\'s modal to wrap this component. Besides, react-native-gesture-handler for Android desnt\'t work with the react modal component.');
    }

    if (props.height) {
      this.snaps.push(0, modalHeight - props.height, modalHeight);
    } else {
      this.snaps.push(0, modalHeight);
    }

    this.snapEnd = this.snaps[this.snaps.length - 1];

    this.state = {
      lastSnap: props.height ? modalHeight - props.height : 0,
      isVisible: false,
      showContent: true,
      overlay: new Animated.Value(0),
      modalHeight,
      contentHeight: 0,
      headerHeight: 0,
      footerHeight: 0,
      enableBounces: true,
      scrollViewHeight: [],
      keyboardEnableScroll: false,
      keyboardToggle: false,
    };

    this.beginScrollY.addListener(({ value }) =>
      this.beginScrollYValue = value,
    );

    this.reverseBeginScrollY = Animated.multiply(
      new Animated.Value(-1),
      this.beginScrollY,
    );
  }

  componentDidMount() {
    this.onScrollViewChange();

    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    Keyboard.addListener('keyboardWillShow', this.onKeyboardShow);
    Keyboard.addListener('keyboardWillHide', this.onKeyboardHide);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    Keyboard.removeListener('keyboardWillShow', this.onKeyboardShow);
    Keyboard.removeListener('keyboardWillHide', this.onKeyboardHide);
  }

  private get isIos(): boolean {
    return Platform.OS === 'ios';
  }

  private get isIphoneX(): boolean {
    // @ts-ignore
    const isIphone = this.isIos && !Platform.isPad && !Platform.isTVOS;

    return isIphone && ((screenHeight === 812 || screenWidth === 812) || (screenHeight === 896 || screenWidth === 896));
  }

  private get isHandleOutside(): boolean {
    const { handlePosition } = this.props;

    return handlePosition === 'outside';
  }

  private get handleHeight(): number {
    const { withHandle } = this.props;

    if (!withHandle) {
      return 20;
    }

    return this.isHandleOutside ? 35 : 20;
  }

  private get wrapper(): StyleProp<unknown> {
    const { modalHeight } = this.state;

    const valueY = Animated.add(
      this.dragY,
      this.reverseBeginScrollY,
    );

    return {
      height: modalHeight,
      transform: [{
        translateY: Animated.add(this.translateY, valueY).interpolate({
          inputRange: [0, this.snapEnd],
          outputRange: [0, this.snapEnd],
          extrapolate: 'clamp',
        }),
      }],
    };
  }

  private get overlay(): StyleProp<unknown> {
    const { overlay } = this.state;

    return {
      opacity: overlay.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
  }

  private onAnimateOpen = (): void => {
    const { onOpened, height, useNativeDriver } = this.props;
    const { overlay, modalHeight } = this.state;
    const toValue = height ? modalHeight - height : 0;

    this.setState({
      isVisible: true,
      showContent: true,
    });

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 1,
        duration: 280,
        easing: Easing.ease,
        useNativeDriver,
      }),

      Animated.spring(this.translateY, {
        toValue,
        bounciness: 5,
        useNativeDriver,
      }),
    ]).start(() => {
      if (onOpened) {
        onOpened();
      }
    });
  }

  private onAnimateClose = (): void => {
    const { onClosed, useNativeDriver, height } = this.props;
    const { overlay } = this.state;
    const lastSnap = height ? this.snaps[1] : 0;

    this.beginScrollYValue = 0;
    this.beginScrollY.setValue(0);

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: 280,
        easing: Easing.ease,
        useNativeDriver,
      }),

      Animated.timing(this.translateY, {
        toValue: screenHeight,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver,
      }),
    ]).start(() => {
      if (onClosed) {
        onClosed();
      }

      this.setState({ showContent: false });
      this.translateY.setValue(screenHeight);
      this.dragY.setValue(0);
      this.willCloseModalize = false;

      this.setState({
        lastSnap,
        isVisible: false,
      });
    });
  }

  private onScrollViewLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
    const { adjustToContentHeight, height } = this.props;
    const { contentHeight, modalHeight } = this.state;

    if (
      !adjustToContentHeight ||
      modalHeight <= nativeEvent.layout.height ||
      height ||
      this.contentAlreadyCalculated
    ) {
      return;
    }

    this.setState({
      contentHeight: nativeEvent.layout.height,
      modalHeight: contentHeight - this.handleHeight,
    }, () => {
      this.contentAlreadyCalculated = true;
    });
  }

  private onScrollViewChange = (keyboardHeight?: number): void => {
    const { adjustToContentHeight } = this.props;
    const { contentHeight, modalHeight, headerHeight, footerHeight } = this.state;
    const scrollViewHeight = [];

    if (keyboardHeight) {
      const statusBarHeight = this.isIphoneX
        ? 48
        : this.isIos
          ? 20
          : StatusBarManager.HEIGHT;

      const height = screenHeight - keyboardHeight - headerHeight - footerHeight - this.handleHeight - statusBarHeight;

      if (contentHeight > height) {
        scrollViewHeight.push({ height });
        this.setState({ keyboardEnableScroll: true });
      }
    } else if (!adjustToContentHeight) {
      const height = modalHeight - headerHeight - footerHeight;

      scrollViewHeight.push({ height });
      this.setState({ keyboardEnableScroll: false });
    }

    this.setState({ scrollViewHeight });
  }

  private onComponentLayout = ({ nativeEvent }: LayoutChangeEvent, type: string): void => {
    const { height } = nativeEvent.layout;

    this.setState({ [`${type}Height`]: height } as any, this.onScrollViewChange);
  }

  private onHandleChildren = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    const { height, useNativeDriver, adjustToContentHeight } = this.props;
    const { lastSnap, contentHeight } = this.state;
    const { velocityY, translationY } = nativeEvent;

    this.setState({ enableBounces: this.beginScrollYValue > 0 || translationY < 0 });

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - this.beginScrollYValue;
      let destSnapPoint = 0;

      if (height) {
        const dragToss = 0.05;
        const endOffsetY = lastSnap + toValue + dragToss * velocityY;

        this.snaps.forEach((snap: number) => {
          const distFromSnap = Math.abs(snap - endOffsetY);

          if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
            destSnapPoint = snap;
            this.willCloseModalize = false;

            if (snap === this.snapEnd) {
              this.willCloseModalize = true;
              this.close();
            }
          }
        });
      } else if (
        translationY > (adjustToContentHeight ? contentHeight / 3 : THRESHOLD) &&
        this.beginScrollYValue === 0
      ) {
        this.willCloseModalize = true;
        this.close();
      }

      if (this.willCloseModalize) {
        return;
      }

      this.setState({ lastSnap: destSnapPoint });
      this.translateY.extractOffset();
      this.translateY.setValue(toValue);
      this.translateY.flattenOffset();
      this.dragY.setValue(0);

      Animated.spring(this.translateY, {
        velocity: velocityY,
        tension: 50,
        friction: 12,
        toValue: destSnapPoint,
        useNativeDriver,
      }).start();
    }
  }

  private onHandleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.ACTIVE && !this.willCloseModalize) {
      this.close();
    }
  }

  private onBackPress = async (): Promise<boolean> => {
    this.close();

    return true;
  }

  private onKeyboardShow = (event: any) => {
    const { height } = event.endCoordinates;

    this.setState({ keyboardToggle: true });
    this.onScrollViewChange(height);
  }

  private onKeyboardHide = () => {
    this.setState({ keyboardToggle: false });
    this.onScrollViewChange();
  }

  private renderComponent = (Component: React.ReactNode, type: string): React.ReactNode => {
    if (!Component) {
      return null;
    }

    return (
      <View
        style={s.component}
        onLayout={event => this.onComponentLayout(event, type)}
      >
        {React.isValidElement(Component)
          ? Component
          // @ts-ignore
          : <Component />
        }
      </View>
    );
  }

  private renderHandle = (): React.ReactNode => {
    const { handleStyle, useNativeDriver } = this.props;
    const handleStyles = [s.handle];
    const shapeStyles = [s.handle__shape, handleStyle];

    if (!this.isHandleOutside) {
      handleStyles.push(s.handleBottom);
      shapeStyles.push(s.handle__shapeBottom);
    }

    return (
      <PanGestureHandler
        simultaneousHandlers={this.modal}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View style={handleStyles}>
          <View style={shapeStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderChildren = (): React.ReactNode => {
    const {
      children,
      useNativeDriver,
      showsVerticalScrollIndicator,
      adjustToContentHeight,
      HeaderComponent,
      FooterComponent,
    } = this.props;

    const {
      contentHeight,
      enableBounces,
      scrollViewHeight,
      keyboardEnableScroll,
      keyboardToggle,
    } = this.state;

    const scrollEnabled = contentHeight === 0 || keyboardEnableScroll;
    const marginBottom = adjustToContentHeight ? 0 : keyboardToggle ? this.handleHeight : 0;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        simultaneousHandlers={[this.modalScrollView, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View style={s.wrapper__scrollview}>
          {this.renderComponent(HeaderComponent, 'header')}

          <KeyboardAvoidingView
            behavior="position"
            style={{ marginBottom }}
            enabled={this.isIos && !adjustToContentHeight}
          >
            <NativeViewGestureHandler
              ref={this.modalScrollView}
              waitFor={this.modal}
              simultaneousHandlers={this.modalChildren}
            >
              <Animated.ScrollView
                style={scrollViewHeight}
                bounces={enableBounces}
                onScrollBeginDrag={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                onLayout={this.onScrollViewLayout}
                scrollEnabled={scrollEnabled}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                keyboardDismissMode="interactive"
              >
                {children}
              </Animated.ScrollView>
            </NativeViewGestureHandler>
          </KeyboardAvoidingView>

          {this.renderComponent(FooterComponent, 'footer')}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderOverlay = (): React.ReactNode => {
    const { useNativeDriver, overlayStyle } = this.props;
    const { showContent } = this.state;

    return (
      <PanGestureHandler
        ref={this.modalOverlay}
        simultaneousHandlers={[this.modal, this.modalOverlayTap]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
          {showContent && (
            <TapGestureHandler
              ref={this.modalOverlayTap}
              waitFor={this.modalOverlay}
              simultaneousHandlers={this.modalOverlay}
              onHandlerStateChange={this.onHandleOverlay}
            >
              <Animated.View style={[StyleSheet.absoluteFill, s.overlay, overlayStyle, this.overlay]} />
            </TapGestureHandler>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderModalize = (): React.ReactNode => {
    const { style, adjustToContentHeight, withHandle } = this.props;
    const { isVisible, lastSnap, showContent } = this.state;

    if (!isVisible) {
      return null;
    }

    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
        <TapGestureHandler
          ref={this.modal}
          maxDurationMs={100000}
          maxDeltaY={lastSnap}
        >
          <View style={StyleSheet.absoluteFill}>
            {showContent && (
              <AnimatedKeyboardAvoidingView
                style={[s.wrapper, this.wrapper, style]}
                behavior="padding"
                enabled={this.isIos && adjustToContentHeight}
              >
                {withHandle && this.renderHandle()}
                {this.renderChildren()}
              </AnimatedKeyboardAvoidingView>
            )}

            {this.renderOverlay()}
          </View>
        </TapGestureHandler>
      </View>
    );
  }

  private renderReactModal = (child: React.ReactNode): React.ReactNode => {
    const { useNativeDriver } = this.props;
    const { isVisible } = this.state;

    return (
      <Modal
        supportedOrientations={['landscape', 'portrait', 'portrait-upside-down']}
        onRequestClose={this.onBackPress}
        hardwareAccelerated={useNativeDriver}
        visible={isVisible}
        transparent
      >
        {child}
      </Modal>
    );
  }

  public open = (): void => {
    const { onOpen } = this.props;

    if (onOpen) {
      onOpen();
    }

    this.onAnimateOpen();
  }

  public close = (): void => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.onAnimateClose();
  }

  render(): React.ReactNode {
    const { withReactModal } = this.props;

    if (withReactModal && this.isIos) {
      return this.renderReactModal(
        this.renderModalize(),
      );
    }

    return this.renderModalize();
  }
}
