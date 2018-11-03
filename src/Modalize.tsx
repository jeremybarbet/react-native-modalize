import * as React from 'react';
import { Animated, StyleSheet, Text, View, Platform, BackAndroid, ViewStyle, TouchableOpacity, Dimensions, Modal, Easing } from 'react-native';
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

import s from './Modalize.styles';

interface IProps {
  children: React.ReactNode;
  swiperPosition: 'outside' | 'inside';
  height?: number;
  style?: ViewStyle;
  onOpen?: () => void;
  onOpened?: () => void;
  onClose?: () => void;
  onClosed?: () => void;
}

interface IState {
  lastSnap: number;
  isVisible: boolean;
  hideContent: boolean;
  overlay: Animated.Value;
}

const { height: screenHeight } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const THRESHOLD = 200;

export default class Modalize extends React.Component<IProps, IState> {

  private snaps: number[];
  private snapStart: number;
  private snapEnd: number;
  private lastScrollYValue: number = 0;
  private lastScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseLastScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalSwiper: React.RefObject<PanGestureHandler> = React.createRef();
  private modalScrollview: React.RefObject<NativeViewGestureHandler> = React.createRef();

  static defaultProps = {
    swiperPosition: 'outside',
  };

  constructor(props: IProps) {
    super(props);

    this.snaps = [];

    // top, middle, bottom
    if (props.height) {
      this.snaps = [0, props.height, 550];
    } else {
      this.snaps = [0, this.modalHeight];
    }

    this.snapStart = this.snaps[0];
    this.snapEnd = this.snaps[this.snaps.length - 1];

    this.state = {
      lastSnap: this.snapEnd,
      isVisible: false,
      hideContent: false,
      overlay: new Animated.Value(0),
    };

    this.lastScrollY.addListener(({ value }) => {
      this.lastScrollYValue = value;
    });

    this.reverseLastScrollY = Animated.multiply(
      new Animated.Value(-1),
      this.lastScrollY,
    );
  }

  get swiperOutside() {
    const { swiperPosition } = this.props;

    return swiperPosition === 'outside';
  }

  get swiperHeight() {
    return this.swiperOutside ? 35 : 20;
  }

  get modalHeight() {
    return screenHeight - this.swiperHeight;
  }

  get height() {
    const { height } = this.props;

    return height || this.modalHeight;
  }

  get wrapper() {
    const valueY = Animated.add(
      this.dragY,
      this.reverseLastScrollY,
    );

    return {
      height: this.modalHeight,
      transform: [{
        translateY: Animated.add(this.translateY, valueY).interpolate({
          inputRange: [this.snapStart, this.snapEnd],
          outputRange: [this.snapStart, this.snapEnd],
          extrapolate: 'clamp',
        }),
      }],
    };
  }

  get overlay() {
    const { overlay } = this.state;

    return {
      opacity: overlay.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
  }

  onAnimateOpen = () => {
    const { onOpened, height } = this.props;
    const { overlay } = this.state;
    const toValue = height ? this.modalHeight - height : 0;

    this.setState({
      isVisible: true,
      hideContent: false,
    });

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 1,
        duration: 280,
        easing: Easing.ease,
        useNativeDriver: true,
      }),

      Animated.spring(this.translateY, {
        toValue,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onOpened) {
        onOpened();
      }
    });
  }

  onAnimateClose = () => {
    const { onClosed } = this.props;
    const { overlay } = this.state;

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),

      Animated.timing(this.translateY, {
        toValue: screenHeight,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClosed) {
        onClosed();
      }

      this.setState({
        isVisible: false,
        hideContent: true,
      });
    });
  }

  onAnimateReset = (
    event: PanGestureHandlerStateChangeEvent,
    lastSnap: number = this.snaps[0],
    translation?: number,
  ) => {
    const { velocityY, translationY } = event.nativeEvent;
    const toValue = translationY - this.lastScrollYValue;
    const translate = translation || toValue;

    this.setState({ lastSnap });
    this.translateY.extractOffset();
    this.translateY.setValue(translate);
    this.translateY.flattenOffset();
    this.dragY.setValue(0);

    Animated.spring(this.translateY, {
      toValue: lastSnap,
      velocity: velocityY,
      tension: 50,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }

  onHandleSwiper = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.BEGAN) {
      this.lastScrollY.setValue(0);
    }

    this.onHandleChildren({ nativeEvent });
  }

  onHandleChildren = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    const { height } = this.props;

    if (!height) {
      return this.onHandleSwiping({ nativeEvent });
    }

    this.onHandleSnapping({ nativeEvent });
  }

  onHandleSwiping = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      if (nativeEvent.translationY > THRESHOLD) {
        this.onClose();
      } else {
        this.onAnimateReset({ nativeEvent });
      }
    }
  }

  onHandleSnapping = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      const { velocityY } = nativeEvent;
      let { translationY } = nativeEvent;
      let destSnapPoint = this.snaps[0];

      translationY -= this.lastScrollYValue;

      const dragToss = 0.05;
      const endOffsetY = this.state.lastSnap + translationY + dragToss * velocityY;

      this.snaps.forEach((snap: number) => {
        const distFromSnap = Math.abs(snap - endOffsetY);

        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
          destSnapPoint = snap;
        }
      });

      this.onAnimateReset({ nativeEvent }, destSnapPoint, translationY);
    }
  }

  onClose = () => {
    this.close();
  }

  onBackPress = () => {
    this.onClose();

    return true;
  }

  onOverlayPress = () => {
    this.onClose();
  }

  open = () => {
    const { onOpen } = this.props;

    if (onOpen) {
      onOpen();
    }

    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.onBackPress);
    }

    this.onAnimateOpen();
  }

  close = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    this.onAnimateClose();
  }

  renderSwiper = () => {
    const swiperStyles = [s.swiper];
    const handleStyles = [s.swiper__handle];

    if (!this.swiperOutside) {
      swiperStyles.push(s.swiperBottom);
      handleStyles.push(s.swiper__handleBottom);
    }

    return (
      <PanGestureHandler
        ref={this.modalSwiper}
        simultaneousHandlers={[this.modalScrollview, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver: true },
        )}
        onHandlerStateChange={this.onHandleSwiper}
      >
        <Animated.View style={swiperStyles}>
          <View style={handleStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  }

  renderChildren = () => {
    const { children } = this.props;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        simultaneousHandlers={[this.modalScrollview, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver: true },
        )}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View>
          <NativeViewGestureHandler
            ref={this.modalScrollview}
            waitFor={this.modal}
            simultaneousHandlers={this.modalChildren}
          >
            <Animated.ScrollView
              bounces={false}
              onScrollBeginDrag={Animated.event(
                [{ nativeEvent: { contentOffset: { y: this.lastScrollY } } }],
                { useNativeDriver: true },
              )}
              scrollEventThrottle={16}
            >
              <TouchableOpacity onPress={this.close}>
                <Text>Close</Text>
              </TouchableOpacity>

              {children}
            </Animated.ScrollView>
          </NativeViewGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  }

  renderOverlay = () => (
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
          <Animated.View style={[StyleSheet.absoluteFill, s.overlay, this.overlay]} />
        </AnimatedTouchableOpacity>
      {/* </PanGestureHandler> */}
    </React.Fragment>
  )

  render() {
    const { style } = this.props;
    const { isVisible, lastSnap } = this.state;
    const max = lastSnap - this.snaps[0];

    console.log('-render');

    return (
      <Modal
        supportedOrientations={['landscape', 'portrait', 'portrait-upside-down']}
        onRequestClose={this.onBackPress}
        visible={isVisible}
        hardwareAccelerated
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
            <Animated.View style={[s.wrapper, this.wrapper, style]}>
              {this.renderSwiper()}
              {this.renderChildren()}
            </Animated.View>

            {this.renderOverlay()}
          </View>
        </TapGestureHandler>
      </Modal>
    );
  }
}
