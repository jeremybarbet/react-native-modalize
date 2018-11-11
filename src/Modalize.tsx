import * as React from 'react';
import { Animated, StyleSheet, View, Platform, ViewStyle, Dimensions, Modal, Easing, LayoutChangeEvent, StyleProp, BackHandler, KeyboardAvoidingView } from 'react-native';
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

import s from './Modalize.styles';

interface IProps {
  children: React.ReactNode;
  handlePosition: 'outside' | 'inside';
  height?: number;
  style?: ViewStyle | ViewStyle[];
  handleStyle?: ViewStyle | ViewStyle[];
  onOpen?: () => void;
  onOpened?: () => void;
  onClose?: () => void;
  onClosed?: () => void;
  useNativeDriver?: boolean;
  adjustToContentHeight?: boolean;
  showsVerticalScrollIndicator?: boolean;
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
}

const { height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const THRESHOLD = 200;

export default class Modalize extends React.Component<IProps, IState> {

  private snaps: number[];
  private snapStart: number;
  private snapEnd: number;
  private beginScrollYValue: number = 0;
  private contentAlreadyCalculated: boolean = false;
  private beginScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseBeginScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalScrollview: React.RefObject<NativeViewGestureHandler> = React.createRef();

  static defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    showsVerticalScrollIndicator: false,
  };

  constructor(props: IProps) {
    super(props);

    const height = this.isIos ? screenHeight : screenHeight - 10;
    const modalHeight = height - this.handleHeight;

    this.snaps = [];

    if (props.height) {
      this.snaps.push(0, modalHeight - props.height, modalHeight);
    } else {
      this.snaps.push(0, modalHeight);
    }

    this.snapStart = this.snaps[0];
    this.snapEnd = this.snaps[this.snaps.length - 1];

    this.state = {
      lastSnap: this.snaps[props.height ? 1 : 0],
      isVisible: false,
      showContent: true,
      overlay: new Animated.Value(0),
      modalHeight,
      contentHeight: 0,
      headerHeight: 0,
      footerHeight: 0,
      enableBounces: true,
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
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  private get isIos(): boolean {
    return Platform.OS === 'ios';
  }

  private get isHandleOutside(): boolean  {
    const { handlePosition } = this.props;

    return handlePosition === 'outside';
  }

  private get handleHeight(): number {
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
          inputRange: [this.snapStart, this.snapEnd],
          outputRange: [this.snapStart, this.snapEnd],
          extrapolate: 'clamp',
        }),
      }],
    };
  }

  private get scrollview(): ViewStyle {
    const { adjustToContentHeight } = this.props;
    const { modalHeight, headerHeight, footerHeight } = this.state;

    if (adjustToContentHeight) {
      return {};
    }

    return { height: modalHeight - headerHeight - footerHeight };
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
    const { onClosed, useNativeDriver } = this.props;
    const { overlay } = this.state;

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

      const { height } = this.props;
      const lastSnap = height ? this.snaps[1] : this.snaps[0];

      this.setState({ showContent: false });
      this.translateY.setValue(screenHeight);
      this.dragY.setValue(0);

      this.setState({
        lastSnap,
        isVisible: false,
      });
    });
  }

  private onScrollviewLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
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

  private onComponentLayout = ({ nativeEvent }: LayoutChangeEvent, type: string): void => {
    const { height } = nativeEvent.layout;

    this.setState({ [`${type}Height`]: height } as any);
  }

  private onHandleChildren = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    const { height, useNativeDriver } = this.props;
    const { lastSnap } = this.state;
    const { velocityY, translationY } = nativeEvent;

    this.setState({ enableBounces: this.beginScrollYValue > 0 || translationY < 0 });

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - this.beginScrollYValue;
      let destSnapPoint = this.snaps[0];
      let willClose = false;

      if (height) {
        const dragToss = 0.05;
        const endOffsetY = lastSnap + toValue + dragToss * velocityY;

        this.snaps.forEach((snap: number) => {
          const distFromSnap = Math.abs(snap - endOffsetY);

          if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
            destSnapPoint = snap;
            willClose = false;

            if (snap === this.snapEnd) {
              willClose = true;
              this.close();
            }
          }
        });
      } else if (translationY > THRESHOLD && this.beginScrollYValue === 0) {
        willClose = true;
        this.close();
      }

      if (willClose) {
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

  private onBackPress = async (): Promise<boolean> => {
    this.close();

    return true;
  }

  private renderComponent = (Component: React.ReactNode, type: string): React.ReactNode => {
    if (!Component) {
      return <View />;
    }

    return (
      <View onLayout={event => this.onComponentLayout(event, type)}>
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

    const { contentHeight, enableBounces } = this.state;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        simultaneousHandlers={[this.modalScrollview, this.modal]}
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
            style={{ paddingBottom: adjustToContentHeight ? 0 : this.handleHeight }}
            enabled={this.isIos && !adjustToContentHeight}
          >
            <NativeViewGestureHandler
              ref={this.modalScrollview}
              waitFor={this.modal}
              simultaneousHandlers={this.modalChildren}
            >
              <Animated.ScrollView
                style={this.scrollview}
                bounces={enableBounces}
                onScrollBeginDrag={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                onLayout={this.onScrollviewLayout}
                scrollEnabled={contentHeight === 0}
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
    const { useNativeDriver } = this.props;
    const { showContent } = this.state;

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
        <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
          {showContent && (
            <Animated.View style={[StyleSheet.absoluteFill, s.overlay, this.overlay]} />
          )}
        </Animated.View>
      </PanGestureHandler>
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
    const { style, useNativeDriver, adjustToContentHeight } = this.props;
    const { isVisible, lastSnap, showContent } = this.state;
    const max = lastSnap - this.snaps[0];

    return (
      <Modal
        supportedOrientations={['landscape', 'portrait', 'portrait-upside-down']}
        onRequestClose={this.onBackPress}
        hardwareAccelerated={useNativeDriver}
        visible={isVisible}
        transparent
      >
        <TapGestureHandler
          ref={this.modal}
          maxDurationMs={100000}
          maxDeltaY={max}
        >
          <View style={StyleSheet.absoluteFill}>
            {showContent && (
              <AnimatedKeyboardAvoidingView
                style={[s.wrapper, this.wrapper, style]}
                behavior="padding"
                enabled={this.isIos && adjustToContentHeight}
              >
                {this.renderHandle()}
                {this.renderChildren()}
              </AnimatedKeyboardAvoidingView>
            )}

            {this.renderOverlay()}
          </View>
        </TapGestureHandler>
      </Modal>
    );
  }
}
