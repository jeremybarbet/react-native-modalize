import * as React from 'react';
import { Animated, StyleSheet, View, Platform, BackAndroid, ViewStyle, TouchableOpacity, Dimensions, Modal, Easing, LayoutChangeEvent, StyleProp, KeyboardAvoidingView } from 'react-native';
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

import s from './Modalize.styles';

interface IProps {
  children: React.ReactNode;
  swiperPosition: 'outside' | 'inside';
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
}

const { height: screenHeight } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const THRESHOLD = 200;

export default class Modalize extends React.Component<IProps, IState> {

  private snaps: number[];
  private snapStart: number;
  private snapEnd: number;
  private beginScrollYValue: number = 0;
  private beginScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseBeginScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalScrollview: React.RefObject<NativeViewGestureHandler> = React.createRef();

  static defaultProps = {
    swiperPosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    showsVerticalScrollIndicator: false,
  };

  constructor(props: IProps) {
    super(props);

    const modalHeight = screenHeight - this.swiperHeight;

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
    };

    this.beginScrollY.addListener(({ value }) =>
      this.beginScrollYValue = value,
    );

    this.reverseBeginScrollY = Animated.multiply(
      new Animated.Value(-1),
      this.beginScrollY,
    );
  }

  private get swiperOutside(): boolean  {
    const { swiperPosition } = this.props;

    return swiperPosition === 'outside';
  }

  private get swiperHeight(): number {
    return this.swiperOutside ? 35 : 20;
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
    const { modalHeight, headerHeight, footerHeight } = this.state;
    const height = modalHeight - headerHeight - footerHeight;

    return { height };
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
        bounciness: 4,
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

  private onScrollViewLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
    const { contentHeight } = this.state;
    const { height } = nativeEvent.layout;

    if (contentHeight > 0) {
      return;
    }

    this.onUpdateLayout(height);
  }

  private onComponentLayout = ({ nativeEvent }: LayoutChangeEvent, type: string): void => {
    const { height } = nativeEvent.layout;

    this.setState({ [`${type}Height`]: height } as any);
  }

  private onUpdateLayout = (h: number): void => {
    const { adjustToContentHeight, height } = this.props;
    const { contentHeight, modalHeight } = this.state;

    if (!adjustToContentHeight || modalHeight === h || height) {
      return;
    }

    this.setState({
      contentHeight: h,
      modalHeight: contentHeight - this.swiperHeight,
    });
  }

  private onHandleChildren = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    const { height, useNativeDriver } = this.props;
    const { lastSnap } = this.state;

    if (nativeEvent.oldState === State.ACTIVE) {
      const { velocityY, translationY } = nativeEvent;
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

  private onBackPress = (): boolean => {
    this.close();

    return true;
  }

  private onOverlayPress = (): void => {
    this.close();
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

  private renderSwiper = (): React.ReactNode => {
    const { handleStyle } = this.props;
    const swiperStyles = [s.swiper];
    const handleStyles = [s.swiper__handle, handleStyle];

    if (!this.swiperOutside) {
      swiperStyles.push(s.swiperBottom);
      handleStyles.push(s.swiper__handleBottom);
    }

    return (
      <View style={swiperStyles}>
        <View style={handleStyles} />
      </View>
    );
  }

  private renderChildren = (): React.ReactNode => {
    const { children, useNativeDriver, showsVerticalScrollIndicator, HeaderComponent, FooterComponent } = this.props;
    const { contentHeight, showContent } = this.state;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        simultaneousHandlers={[this.modalScrollview, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event([{ nativeEvent: { translationY: this.dragY } }], { useNativeDriver })}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View>
          {this.renderComponent(HeaderComponent, 'header')}

          <NativeViewGestureHandler
            ref={this.modalScrollview}
            waitFor={this.modal}
            simultaneousHandlers={this.modalChildren}
          >
            <Animated.ScrollView
              style={this.scrollview}
              bounces={false}
              onScrollBeginDrag={Animated.event([{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }], { useNativeDriver: false })}
              scrollEventThrottle={16}
              onLayout={this.onScrollViewLayout}
              scrollEnabled={contentHeight === 0}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            >
              {showContent && children}
            </Animated.ScrollView>
          </NativeViewGestureHandler>

          {this.renderComponent(FooterComponent, 'footer')}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderOverlay = (): React.ReactNode => {
    const { showContent } = this.state;

    return (
      <React.Fragment>
        {/* <PanGestureHandler
          ref={this.modalSwiper}
          simultaneousHandlers={[this.modalScrollview, this.modal]}
          shouldCancelWhenOutside={false}
          onGestureEvent={this.onGestureEvent}
          onHandlerStateChange={this.onHeaderHandlerStateChange}
        > */}
          <AnimatedTouchableOpacity
            onPress={this.onOverlayPress}
            activeOpacity={0.95}
            style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
          >
            {showContent && <Animated.View style={[StyleSheet.absoluteFill, s.overlay, this.overlay]} />}
          </AnimatedTouchableOpacity>
        {/* </PanGestureHandler> */}
      </React.Fragment>
    );
  }

  public open = (): void => {
    const { onOpen } = this.props;

    if (onOpen) {
      onOpen();
    }

    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.onBackPress);
    }

    this.onAnimateOpen();
  }

  public close = (): void => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    this.onAnimateClose();
  }

  render(): React.ReactNode {
    const { style, useNativeDriver } = this.props;
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
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {showContent && (
              <AnimatedKeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                pointerEvents="box-none"
                style={[s.wrapper, this.wrapper, style]}
              >
                {this.renderSwiper()}
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
