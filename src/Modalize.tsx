import * as React from 'react';
import { Animated, View, Platform, Dimensions, Modal, Easing, LayoutChangeEvent, StyleProp, BackHandler, KeyboardAvoidingView, Keyboard, NativeModules, StyleSheet, ScrollView, FlatList, SectionList } from 'react-native';
import { PanGestureHandler, NativeViewGestureHandler, State, TapGestureHandler, PanGestureHandlerStateChangeEvent, TapGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

import { IProps, IState } from './Options';
import s from './Modalize.styles';

const { StatusBarManager } = NativeModules;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const THRESHOLD = 150;

export default class Modalize extends React.Component<IProps, IState> {

  static defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    withReactModal: false,
    withHandle: true,
  };

  private snaps: number[] = [];
  private snapEnd: number;
  private beginScrollYValue: number = 0;
  private contentAlreadyCalculated: boolean = false;
  private beginScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseBeginScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalContentView: React.RefObject<NativeViewGestureHandler> = React.createRef();
  private contentView: React.RefObject<ScrollView | FlatList<any> | SectionList<any>> = React.createRef();
  private modalOverlay: React.RefObject<PanGestureHandler> = React.createRef();
  private modalOverlayTap: React.RefObject<TapGestureHandler> = React.createRef();
  private willCloseModalize: boolean = false;

  constructor(props: IProps) {
    super(props);

    const height = this.isIos ? screenHeight : screenHeight - 10;
    const modalHeight = height - this.handleHeight - (this.isIphoneX ? 34 : 0);

    if (props.withReactModal) {
      console.warn(
        '[react-native-modalize] `withReactModal` is set to `true`. Modal from react-native is going ' +
        'to be moved out of the core in the future. I\'d recommend migrating to something like ' +
        'react-navigation or react-native-navigation\'s to wrap Modalize. Check out the documentation ' +
        'for more informations.',
      );
    }

    if ((props.scrollViewProps || props.children) && props.flatListProps) {
      console.error(
        '[react-native-modalize] `flatListProps` You can\'t use the ScrollView and the FlatList at the ' +
        'same time. As soon as you use `flatListProps` it will replaces the default ScrollView with ' +
        'a FlatList component. Remove the `children` and/or `scrollViewProps` to fix the error.',
      );
    }

    if ((props.scrollViewProps || props.children) && props.sectionListProps) {
      console.error(
        '[react-native-modalize] `sectionListProps` You can\'t use the ScrollView and the SectionList at the ' +
        'same time. As soon as you use `sectionListProps` it will replaces the default ScrollView with ' +
        'a SectionList component. Remove the `children` and/or `scrollViewProps` to fix the error.',
      );
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
      contentViewHeight: [],
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
    this.onContentViewChange();

    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    Keyboard.addListener('keyboardWillShow', this.onKeyboardShow);
    Keyboard.addListener('keyboardWillHide', this.onKeyboardHide);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    Keyboard.removeListener('keyboardWillShow', this.onKeyboardShow);
    Keyboard.removeListener('keyboardWillHide', this.onKeyboardHide);
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

  public scrollTo = (...args: Parameters<ScrollView['scrollTo']>): void => {
    if (this.contentView.current) {
      (this.contentView.current as any).getNode().scrollTo(...args);
    }
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

  private get modalizeContent(): StyleProp<any> {
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

  private get overlayBackground(): StyleProp<any> {
    const { overlay } = this.state;

    return {
      opacity: overlay.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
  }

  private isAbsolute = (Component: React.ReactNode): boolean => {
    if (!React.isValidElement(Component)) {
      return false;
    }

    // @ts-ignore
    const style: StyleProp<any> = Component && StyleSheet.flatten(Component().props.style);

    return style && style.position === 'absolute';
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

  private onContentViewLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
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

    // @todo: modalHeight should be equal to the nativeEvent's height,
    // and not to the state's value which is 0 at the first mount
    this.setState({
      contentHeight: nativeEvent.layout.height,
      modalHeight: contentHeight - this.handleHeight,
    }, () => {
      this.contentAlreadyCalculated = true;
    });
  }

  private onContentViewChange = (keyboardHeight?: number): void => {
    const { adjustToContentHeight } = this.props;
    const { contentHeight, modalHeight, headerHeight, footerHeight } = this.state;
    const contentViewHeight = [];

    if (keyboardHeight) {
      const statusBarHeight = this.isIphoneX ? 48 : this.isIos ? 20 : StatusBarManager.HEIGHT;
      const height = screenHeight - keyboardHeight - headerHeight - footerHeight - this.handleHeight - statusBarHeight;

      if (contentHeight > height) {
        contentViewHeight.push({ height });
        this.setState({ keyboardEnableScroll: true });
      }
    } else if (!adjustToContentHeight) {
      const height = modalHeight - headerHeight - footerHeight;

      contentViewHeight.push({ height });
      this.setState({ keyboardEnableScroll: false });
    }

    this.setState({ contentViewHeight });
  }

  private onHandleComponent = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.BEGAN) {
      this.beginScrollY.setValue(0);
    }

    this.onHandleChildren({ nativeEvent });
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
    const { onBackButtonPress } = this.props;

    if (onBackButtonPress) {
      onBackButtonPress();
    } else {
      this.close();
    }

    return true;
  }

  private onKeyboardShow = (event: any) => {
    const { height } = event.endCoordinates;

    this.setState({ keyboardToggle: true });
    this.onContentViewChange(height);
  }

  private onKeyboardHide = () => {
    this.setState({ keyboardToggle: false });
    this.onContentViewChange();
  }

  private renderComponent = (Component: React.ReactNode, name: string): React.ReactNode => {
    // @ts-ignore
    const element = React.isValidElement(Component) ? Component : <Component />;

    // We don't need to calculate header and footer if they are absolutely positioned
    if (Component && this.isAbsolute(Component)) {
      return element;
    }

    const onLayout = ({ nativeEvent }: LayoutChangeEvent) =>
      this.setState({ [`${name}Height`]: nativeEvent.layout.height } as any, this.onContentViewChange);

    return (
      <View
        style={s.component}
        onLayout={onLayout}
        pointerEvents="box-none"
      >
        {element}
      </View>
    );
  }

  private renderHandle = (): React.ReactNode => {
    const { handleStyle, useNativeDriver, withHandle } = this.props;
    const handleStyles: any[] = [s.handle];
    const shapeStyles: any[] = [s.handle__shape, handleStyle];

    if (!withHandle) {
      return null;
    }

    if (!this.isHandleOutside) {
      handleStyles.push(s.handleBottom);
      shapeStyles.push(s.handle__shapeBottom, handleStyle);
    }

    return (
      <PanGestureHandler
        simultaneousHandlers={this.modal}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View style={handleStyles}>
          <View style={shapeStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderHeader = (): React.ReactNode => {
    const { useNativeDriver, HeaderComponent } = this.props;

    if (!HeaderComponent) {
      return null;
    }

    if (this.isAbsolute(HeaderComponent)) {
      return this.renderComponent(HeaderComponent, 'header');
    }

    return (
      <PanGestureHandler
        simultaneousHandlers={this.modal}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View
          style={s.component}
          pointerEvents="box-none"
        >
          {this.renderComponent(HeaderComponent, 'header')}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderContent = (): React.ReactNode => {
    const { children, scrollViewProps, flatListProps, sectionListProps } = this.props;
    const { contentHeight, enableBounces, contentViewHeight, keyboardEnableScroll } = this.state;
    const scrollEnabled = contentHeight === 0 || keyboardEnableScroll;
    const keyboardDismissMode = this.isIos ? 'interactive' : 'on-drag';

    const opts = {
      ref: this.contentView,
      style: contentViewHeight,
      bounces: enableBounces,
      onScrollBeginDrag: Animated.event(
        [{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }],
        { useNativeDriver: false },
      ),
      scrollEventThrottle: 16,
      onLayout: this.onContentViewLayout,
      scrollEnabled,
    };

    if (flatListProps) {
      return (
        <AnimatedFlatList
          {...opts}
          {...flatListProps}
        />
      );
    }

    if (sectionListProps) {
      return (
        <AnimatedSectionList
          {...opts}
          {...sectionListProps}
        />
      );
    }

    return (
      <Animated.ScrollView
        {...opts}
        {...scrollViewProps}
        keyboardDismissMode={keyboardDismissMode}
      >
        {children}
      </Animated.ScrollView>
    );
  }

  private renderChildren = (): React.ReactNode => {
    const { useNativeDriver, adjustToContentHeight, keyboardAvoidingBehavior } = this.props;
    const { keyboardToggle } = this.state;
    const marginBottom = adjustToContentHeight ? 0 : keyboardToggle ? this.handleHeight : 0;
    const enabled = this.isIos && !adjustToContentHeight;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        simultaneousHandlers={[this.modalContentView, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event(
          [{ nativeEvent: { translationY: this.dragY } }],
          { useNativeDriver },
        )}
        onHandlerStateChange={this.onHandleChildren}
      >
        <AnimatedKeyboardAvoidingView
          behavior={keyboardAvoidingBehavior || 'position'}
          style={{ marginBottom }}
          enabled={enabled}
        >
          <NativeViewGestureHandler
            ref={this.modalContentView}
            waitFor={this.modal}
            simultaneousHandlers={this.modalChildren}
          >
            {this.renderContent()}
          </NativeViewGestureHandler>
        </AnimatedKeyboardAvoidingView>
      </PanGestureHandler>
    );
  }

  private renderFooter = (): React.ReactNode => {
    const { FooterComponent } = this.props;

    if (!FooterComponent) {
      return null;
    }

    return this.renderComponent(FooterComponent, 'footer');
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
        <Animated.View style={s.overlay}>
          {showContent && (
            <TapGestureHandler
              ref={this.modalOverlayTap}
              waitFor={this.modalOverlay}
              simultaneousHandlers={this.modalOverlay}
              onHandlerStateChange={this.onHandleOverlay}
            >
              <Animated.View style={[s.overlay__background, overlayStyle, this.overlayBackground]} />
            </TapGestureHandler>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  private renderModalize = (): React.ReactNode => {
    const { style, adjustToContentHeight, keyboardAvoidingBehavior } = this.props;
    const { isVisible, lastSnap, showContent } = this.state;
    const enabled = this.isIos && adjustToContentHeight;

    if (!isVisible) {
      return null;
    }

    return (
      <View style={s.modalize}>
        <TapGestureHandler
          ref={this.modal}
          maxDurationMs={100000}
          maxDeltaY={lastSnap}
        >
          <View
            style={s.modalize__wrapper}
            pointerEvents="box-none"
          >
            {showContent && (
              <AnimatedKeyboardAvoidingView
                style={[s.modalize__content, this.modalizeContent, style]}
                behavior={keyboardAvoidingBehavior || 'padding'}
                enabled={enabled}
              >
                {this.renderHandle()}
                {this.renderHeader()}
                {this.renderChildren()}
                {this.renderFooter()}
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

  render(): React.ReactNode {
    const { withReactModal } = this.props;

    if (withReactModal) {
      return this.renderReactModal(
        this.renderModalize(),
      );
    }

    return this.renderModalize();
  }
}
