import * as React from 'react';
import {
  Animated,
  View,
  Dimensions,
  Modal,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  FlatList,
  SectionList,
  Platform,
  StatusBar,
  KeyboardAvoidingViewProps,
} from 'react-native';
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler,
  PanGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { IProps, IState, TOpen, TClose } from './options';
import { getSpringConfig } from './utils/get-spring-config';
import { isIphoneX, isIos } from './utils/devices';
import { hasAbsoluteStyle } from './utils/has-absolute-style';
import s from './styles';

const { height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const GestureHandlerWrapper = GestureHandlerRootView ?? View;
const THRESHOLD = 150;
const ACTIVATED = 20;
const PAN_DURATION = 150;

export class Modalize<FlatListItem = any, SectionListItem = any> extends React.Component<
  IProps<FlatListItem, SectionListItem>,
  IState
> {
  static defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    disableScrollIfPossible: true,
    avoidKeyboardLikeIOS: Platform.select({
      ios: true,
      android: false,
      default: true,
    }),
    modalTopOffset: Platform.select({
      ios: 0,
      android: StatusBar.currentHeight || 0,
      default: 0,
    }),
    panGestureEnabled: true,
    closeOnOverlayTap: true,
    withReactModal: false,
    withHandle: true,
    openAnimationConfig: {
      timing: { duration: 280, easing: Easing.ease },
      spring: { speed: 14, bounciness: 4 },
    },
    closeAnimationConfig: {
      timing: { duration: 280, easing: Easing.ease },
    },
    dragToss: 0.05,
  };

  private snaps: number[] = [];
  private snapEnd: number;
  private beginScrollYValue: number = 0;
  private beginScrollY: Animated.Value = new Animated.Value(0);
  private dragY: Animated.Value = new Animated.Value(0);
  private translateY: Animated.Value = new Animated.Value(screenHeight);
  private reverseBeginScrollY: Animated.AnimatedMultiplication;
  private modal: React.RefObject<TapGestureHandler> = React.createRef();
  private modalChildren: React.RefObject<PanGestureHandler> = React.createRef();
  private modalContentView: React.RefObject<NativeViewGestureHandler> = React.createRef();
  private contentView: React.RefObject<
    ScrollView | FlatList<any> | SectionList<any>
  > = React.createRef();
  private modalOverlay: React.RefObject<PanGestureHandler> = React.createRef();
  private modalOverlayTap: React.RefObject<TapGestureHandler> = React.createRef();
  private willCloseModalize: boolean = false;
  private initialComputedModalHeight: number = 0;
  private modalPosition: 'top' | 'initial';

  constructor(props: IProps<FlatListItem, SectionListItem>) {
    super(props);

    const fullHeight = screenHeight - props.modalTopOffset!;
    const computedHeight = fullHeight - this.handleHeight - (isIphoneX ? 34 : 0);
    const modalHeight = props.modalHeight || computedHeight;

    this.initialComputedModalHeight = modalHeight;

    if (props.withReactModal) {
      console.warn(
        `[react-native-modalize] 'withReactModal' is set to 'true'. Modal from react-native is going to be moved out of the core in the future. I\'d recommend migrating to something like react-navigation or react-native-navigation\'s to wrap Modalize. Check out the documentation for more informations.`,
      );
    }

    if (props.modalHeight && props.adjustToContentHeight) {
      console.error(
        `[react-native-modalize] You cannot use both 'modalHeight' and 'adjustToContentHeight' props at the same time. Only choose one of the two.`,
      );
    }

    if ((props.scrollViewProps || props.children) && props.flatListProps) {
      console.error(
        `[react-native-modalize] 'flatListProps' You can\'t use the ScrollView and the FlatList at the 'same time. As soon as you use 'flatListProps' it will replaces the default ScrollView with 'a FlatList component. Remove the 'children' and/or 'scrollViewProps' to fix the error.`,
      );
    }

    if ((props.scrollViewProps || props.children) && props.sectionListProps) {
      console.error(
        `[react-native-modalize] 'sectionListProps' You can\'t use the ScrollView and the SectionList at the 'same time. As soon as you use 'sectionListProps' it will replaces the default ScrollView with 'a SectionList component. Remove the 'children' and/or 'scrollViewProps' to fix the error.`,
      );
    }

    if (props.snapPoint) {
      this.snaps.push(0, modalHeight - props.snapPoint, modalHeight);
    } else {
      this.snaps.push(0, modalHeight);
    }

    this.snapEnd = this.snaps[this.snaps.length - 1];

    this.state = {
      lastSnap: props.snapPoint ? modalHeight - props.snapPoint : 0,
      isVisible: false,
      showContent: true,
      overlay: new Animated.Value(0),
      modalHeight: props.adjustToContentHeight ? undefined : modalHeight,
      contentHeight: 0,
      enableBounces: true,
      keyboardToggle: false,
      keyboardHeight: 0,
      disableScroll: props.alwaysOpen ? true : undefined,
    };

    this.beginScrollY.addListener(({ value }) => (this.beginScrollYValue = value));
    this.reverseBeginScrollY = Animated.multiply(new Animated.Value(-1), this.beginScrollY);
  }

  componentDidMount() {
    const { alwaysOpen } = this.props;

    if (alwaysOpen) {
      this.onAnimateOpen(alwaysOpen);
    }

    Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
    Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
  }

  componentDidUpdate({ adjustToContentHeight }: IProps) {
    const { adjustToContentHeight: nextAdjust } = this.props;

    if (nextAdjust !== adjustToContentHeight) {
      this.setState({
        modalHeight: nextAdjust ? undefined : this.initialComputedModalHeight,
      });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    Keyboard.removeListener('keyboardDidShow', this.onKeyboardShow);
    Keyboard.removeListener('keyboardDidHide', this.onKeyboardHide);
  }

  public open = (dest?: TOpen): void => {
    const { onOpen, alwaysOpen } = this.props;

    if (onOpen) {
      onOpen();
    }

    this.onAnimateOpen(alwaysOpen, dest);
  };

  public close = (dest?: TClose): void => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.onAnimateClose(dest);
  };

  public scrollTo = (...args: Parameters<ScrollView['scrollTo']>): void => {
    if (this.contentView.current) {
      const ref = this.contentView.current as any;

      // since RN 0.62 the getNode call has been deprecated
      const scrollResponder = ref.getScrollResponder
        ? ref.getScrollResponder()
        : ref.getNode().getScrollResponder();

      scrollResponder.scrollTo(...args);
    }
  };

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
    const valueY = Animated.add(this.dragY, this.reverseBeginScrollY);

    return {
      height: modalHeight,
      maxHeight: this.initialComputedModalHeight,
      transform: [
        {
          translateY: Animated.add(this.translateY, valueY).interpolate({
            inputRange: [-40, 0, this.snapEnd],
            outputRange: [0, 0, this.snapEnd],
            extrapolate: 'clamp',
          }),
        },
      ],
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

  private onAnimateOpen = (alwaysOpen: number | undefined, dest: TOpen = 'default'): void => {
    const {
      onOpened,
      snapPoint,
      useNativeDriver,
      openAnimationConfig,
      onPositionChange,
      panGestureAnimatedValue,
    } = this.props;

    const { timing, spring } = openAnimationConfig!;
    const { overlay, modalHeight } = this.state;

    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    let toValue = 0;
    let toPanValue = 0;

    if (dest === 'top') {
      toValue = 0;
    } else if (alwaysOpen) {
      toValue = (modalHeight || 0) - alwaysOpen;
    } else if (snapPoint) {
      toValue = (modalHeight || 0) - snapPoint;
    }

    if (panGestureAnimatedValue && (alwaysOpen || snapPoint)) {
      toPanValue = 0;
    } else if (panGestureAnimatedValue && !alwaysOpen && (dest === 'top' || dest === 'default')) {
      toPanValue = 1;
    }

    this.setState({
      isVisible: true,
      showContent: true,
    });

    if ((alwaysOpen && dest !== 'top') || (snapPoint && dest === 'default')) {
      this.modalPosition = 'initial';
    } else {
      this.modalPosition = 'top';
    }

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: alwaysOpen && dest === 'default' ? 0 : 1,
        duration: timing.duration,
        easing: Easing.ease,
        useNativeDriver,
      }),

      panGestureAnimatedValue
        ? Animated.timing(panGestureAnimatedValue, {
            toValue: toPanValue,
            duration: PAN_DURATION,
            useNativeDriver,
          })
        : Animated.delay(0),

      spring
        ? Animated.spring(this.translateY, {
            ...getSpringConfig(spring),
            toValue,
            useNativeDriver,
          })
        : Animated.timing(this.translateY, {
            toValue,
            duration: timing.duration,
            easing: timing.easing,
            useNativeDriver,
          }),
    ]).start(() => {
      if (onOpened) {
        onOpened();
      }

      if (onPositionChange) {
        onPositionChange(this.modalPosition);
      }
    });
  };

  private onAnimateClose = (dest: TClose = 'default'): void => {
    const {
      onClosed,
      useNativeDriver,
      snapPoint,
      closeAnimationConfig,
      alwaysOpen,
      onPositionChange,
      panGestureAnimatedValue,
    } = this.props;
    const { timing, spring } = closeAnimationConfig!;
    const { overlay, modalHeight } = this.state;
    const lastSnap = snapPoint ? this.snaps[1] : 80;
    const toInitialAlwaysOpen = dest === 'alwaysOpen' && Boolean(alwaysOpen);
    const toValue = toInitialAlwaysOpen ? (modalHeight || 0) - alwaysOpen! : screenHeight;

    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);

    this.beginScrollYValue = 0;
    this.beginScrollY.setValue(0);

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: 0,
        duration: timing.duration,
        easing: Easing.ease,
        useNativeDriver,
      }),

      panGestureAnimatedValue
        ? Animated.timing(panGestureAnimatedValue, {
            toValue: 0,
            duration: PAN_DURATION,
            useNativeDriver,
          })
        : Animated.delay(0),

      spring
        ? Animated.spring(this.translateY, {
            ...getSpringConfig(spring),
            toValue,
            useNativeDriver,
          })
        : Animated.timing(this.translateY, {
            duration: timing.duration,
            easing: Easing.out(Easing.ease),
            toValue,
            useNativeDriver,
          }),
    ]).start(() => {
      if (onClosed) {
        onClosed();
      }

      if (alwaysOpen && dest === 'alwaysOpen' && onPositionChange) {
        onPositionChange('initial');
      }

      if (alwaysOpen && dest === 'alwaysOpen') {
        this.modalPosition = 'initial';
      }

      this.setState({ showContent: toInitialAlwaysOpen });
      this.translateY.setValue(toValue);
      this.dragY.setValue(0);
      this.willCloseModalize = false;

      this.setState({
        lastSnap,
        isVisible: toInitialAlwaysOpen,
      });
    });
  };

  private onModalizeContentLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent): void => {
    const { adjustToContentHeight } = this.props;
    const { keyboardHeight } = this.state;

    this.setState({
      modalHeight: Math.min(
        layout.height + (!adjustToContentHeight || keyboardHeight ? layout.y : 0),
        this.initialComputedModalHeight -
          Platform.select({
            ios: 0,
            android: keyboardHeight,
          })!,
      ),
    });
  };

  private onContentViewLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
    const { adjustToContentHeight, disableScrollIfPossible, onLayout } = this.props;

    if (onLayout) {
      onLayout(nativeEvent);
    }

    if (!adjustToContentHeight) {
      return;
    }

    const { height } = nativeEvent.layout;
    const shorterHeight = height < this.initialComputedModalHeight;
    const disableScroll = shorterHeight && disableScrollIfPossible;

    this.setState({ disableScroll });
  };

  private onHandleComponent = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.BEGAN) {
      this.beginScrollY.setValue(0);
    }

    this.onHandleChildren({ nativeEvent });
  };

  private onHandleChildren = ({ nativeEvent }: PanGestureHandlerStateChangeEvent): void => {
    const {
      snapPoint,
      useNativeDriver,
      adjustToContentHeight,
      alwaysOpen,
      closeAnimationConfig,
      dragToss,
      onPositionChange,
      panGestureAnimatedValue,
    } = this.props;
    const { timing } = closeAnimationConfig!;
    const { lastSnap, modalHeight, overlay } = this.state;
    const { velocityY, translationY } = nativeEvent;

    this.setState({ enableBounces: this.beginScrollYValue > 0 || translationY < 0 });

    if (nativeEvent.oldState === State.ACTIVE) {
      const toValue = translationY - this.beginScrollYValue;
      let destSnapPoint = 0;

      if (snapPoint || alwaysOpen) {
        const endOffsetY = lastSnap + toValue + dragToss * velocityY;

        this.snaps.forEach((snap: number) => {
          const distFromSnap = Math.abs(snap - endOffsetY);

          if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
            destSnapPoint = snap;
            this.willCloseModalize = false;

            if (alwaysOpen) {
              destSnapPoint = (modalHeight || 0) - alwaysOpen;
            }

            if (snap === this.snapEnd && !alwaysOpen) {
              this.willCloseModalize = true;
              this.close();
            }
          }
        });
      } else if (
        translationY > (adjustToContentHeight ? (modalHeight || 0) / 3 : THRESHOLD) &&
        this.beginScrollYValue === 0 &&
        !alwaysOpen
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

      if (alwaysOpen) {
        Animated.timing(overlay, {
          toValue: Number(destSnapPoint <= 0),
          duration: timing.duration,
          easing: Easing.ease,
          useNativeDriver,
        }).start();
      }

      Animated.spring(this.translateY, {
        tension: 50,
        friction: 12,
        velocity: velocityY,
        toValue: destSnapPoint,
        useNativeDriver,
      }).start();

      if (this.beginScrollYValue === 0) {
        const modalPosition = Boolean(destSnapPoint <= 0) ? 'top' : 'initial';

        if (panGestureAnimatedValue) {
          Animated.timing(panGestureAnimatedValue, {
            toValue: Number(modalPosition === 'top'),
            duration: PAN_DURATION,
            useNativeDriver,
          }).start();
        }

        if (!adjustToContentHeight && modalPosition === 'top') {
          this.setState({ disableScroll: false });
        }

        if (onPositionChange && this.modalPosition !== modalPosition) {
          onPositionChange(modalPosition);
        }

        if (this.modalPosition !== modalPosition) {
          this.modalPosition = modalPosition;
        }
      }
    }
  };

  private onHandleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    const { alwaysOpen, onOverlayPress } = this.props;

    if (nativeEvent.oldState === State.ACTIVE && !this.willCloseModalize) {
      if (onOverlayPress) {
        onOverlayPress();
      }

      const dest = !!alwaysOpen ? 'alwaysOpen' : 'default';

      this.close(dest);
    }
  };

  private onBackPress = (): boolean => {
    const { onBackButtonPress, alwaysOpen } = this.props;

    if (alwaysOpen) {
      return false;
    }

    if (onBackButtonPress) {
      return onBackButtonPress();
    } else {
      this.close();
    }

    return true;
  };

  private onKeyboardShow = (event: any) => {
    const { height } = event.endCoordinates;

    this.setState({ keyboardToggle: true, keyboardHeight: height });
  };

  private onKeyboardHide = () => {
    this.setState({ keyboardToggle: false, keyboardHeight: 0 });
  };

  private onGestureEvent = Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
    useNativeDriver: this.props.useNativeDriver,
    listener: ({ nativeEvent: { translationY } }: PanGestureHandlerStateChangeEvent) => {
      const { panGestureAnimatedValue } = this.props;
      const offset = 200;

      if (panGestureAnimatedValue) {
        const diff = Math.abs(translationY / (this.initialComputedModalHeight - offset));
        const y = translationY < 0 ? diff : 1 - diff;

        let value: number;

        if (this.modalPosition === 'initial' && translationY > 0) {
          value = 0;
        } else if (this.modalPosition === 'top' && translationY <= 0) {
          value = 1;
        } else {
          value = y;
        }

        panGestureAnimatedValue.setValue(value);
      }
    },
  });

  private renderComponent = (Tag: React.ReactNode): React.ReactNode => {
    return React.isValidElement(Tag) ? (
      Tag
    ) : (
      // @ts-ignore
      <Tag />
    );
  };

  private renderHandle = (): React.ReactNode => {
    const { handleStyle, withHandle, panGestureEnabled } = this.props;
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
        enabled={panGestureEnabled}
        simultaneousHandlers={this.modal}
        shouldCancelWhenOutside={false}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View style={handleStyles}>
          <View style={shapeStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  };

  private renderHeader = (): React.ReactNode => {
    const { HeaderComponent, panGestureEnabled } = this.props;

    if (!HeaderComponent) {
      return null;
    }

    if (hasAbsoluteStyle(HeaderComponent)) {
      return this.renderComponent(HeaderComponent);
    }

    return (
      <PanGestureHandler
        enabled={panGestureEnabled}
        simultaneousHandlers={this.modal}
        shouldCancelWhenOutside={false}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View style={s.component}>{this.renderComponent(HeaderComponent)}</Animated.View>
      </PanGestureHandler>
    );
  };

  private renderContent = (): React.ReactNode => {
    const { children, scrollViewProps, flatListProps, sectionListProps } = this.props;
    const { enableBounces, disableScroll, keyboardToggle } = this.state;
    const keyboardDismissMode = isIos ? 'interactive' : 'on-drag';

    const opts = {
      ref: this.contentView,
      bounces: enableBounces,
      onScrollBeginDrag: Animated.event(
        [{ nativeEvent: { contentOffset: { y: this.beginScrollY } } }],
        { useNativeDriver: false },
      ),
      scrollEventThrottle: 16,
      onLayout: this.onContentViewLayout,
      scrollEnabled: keyboardToggle || !disableScroll,
      keyboardDismissMode,
    };

    if (flatListProps) {
      return <AnimatedFlatList {...opts} {...flatListProps} />;
    }

    if (sectionListProps) {
      return <AnimatedSectionList {...opts} {...sectionListProps} />;
    }

    return (
      <Animated.ScrollView {...opts} {...scrollViewProps}>
        {children}
      </Animated.ScrollView>
    );
  };

  private renderChildren = (): React.ReactNode => {
    const { adjustToContentHeight, panGestureEnabled } = this.props;
    const style = adjustToContentHeight ? s.content__adjustHeight : s.content__container;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        enabled={panGestureEnabled}
        simultaneousHandlers={[this.modalContentView, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={this.onGestureEvent}
        minDist={ACTIVATED}
        activeOffsetY={ACTIVATED}
        activeOffsetX={ACTIVATED}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View style={style}>
          <NativeViewGestureHandler
            ref={this.modalContentView}
            waitFor={this.modal}
            simultaneousHandlers={this.modalChildren}
          >
            {this.renderContent()}
          </NativeViewGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  private renderFooter = (): React.ReactNode => {
    const { FooterComponent } = this.props;

    if (!FooterComponent) {
      return null;
    }

    return this.renderComponent(FooterComponent);
  };

  private renderFloatingComponent = (): React.ReactNode => {
    const { FloatingComponent } = this.props;

    if (!FloatingComponent) {
      return null;
    }

    return this.renderComponent(FloatingComponent);
  };

  private renderOverlay = (): React.ReactNode => {
    const { overlayStyle, alwaysOpen, panGestureEnabled, closeOnOverlayTap } = this.props;
    const { showContent } = this.state;
    const pointerEvents =
      alwaysOpen && (this.modalPosition === 'initial' || !this.modalPosition) ? 'box-none' : 'auto';

    return (
      <PanGestureHandler
        ref={this.modalOverlay}
        enabled={panGestureEnabled}
        simultaneousHandlers={[this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View style={s.overlay} pointerEvents={pointerEvents}>
          {showContent && (
            <TapGestureHandler
              ref={this.modalOverlayTap}
              enabled={panGestureEnabled || closeOnOverlayTap}
              onHandlerStateChange={this.onHandleOverlay}
            >
              <Animated.View
                style={[s.overlay__background, overlayStyle, this.overlayBackground]}
                pointerEvents={pointerEvents}
              />
            </TapGestureHandler>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  private renderModalize = (): React.ReactNode => {
    const {
      keyboardAvoidingOffset,
      modalStyle,
      keyboardAvoidingBehavior,
      alwaysOpen,
      panGestureEnabled,
      avoidKeyboardLikeIOS,
      adjustToContentHeight,
      modalElevation: elevation,
    } = this.props;
    const { isVisible, lastSnap, showContent } = this.state;
    const pointerEvents = alwaysOpen ? 'box-none' : 'auto';

    const keyboardAvoidingViewProps: Animated.AnimatedProps<KeyboardAvoidingViewProps> = {
      keyboardVerticalOffset: keyboardAvoidingOffset,
      behavior: keyboardAvoidingBehavior || 'padding',
      enabled: avoidKeyboardLikeIOS,
      style: [s.modalize__content, this.modalizeContent, modalStyle],
    };

    if (!avoidKeyboardLikeIOS && !adjustToContentHeight) {
      keyboardAvoidingViewProps.onLayout = this.onModalizeContentLayout;
    }

    if (!isVisible) {
      return null;
    }

    return (
      <GestureHandlerWrapper style={[s.modalize, { elevation }]} pointerEvents={pointerEvents}>
        {this.renderFloatingComponent()}

        <TapGestureHandler
          ref={this.modal}
          maxDurationMs={100000}
          maxDeltaY={lastSnap}
          enabled={panGestureEnabled}
        >
          <View style={s.modalize__wrapper} pointerEvents="box-none">
            {showContent && (
              <AnimatedKeyboardAvoidingView {...keyboardAvoidingViewProps}>
                {this.renderHandle()}
                {this.renderHeader()}
                {this.renderChildren()}
                {this.renderFooter()}
              </AnimatedKeyboardAvoidingView>
            )}

            {this.renderOverlay()}
          </View>
        </TapGestureHandler>
      </GestureHandlerWrapper>
    );
  };

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
  };

  render(): React.ReactNode {
    const { withReactModal } = this.props;

    if (withReactModal) {
      return this.renderReactModal(this.renderModalize());
    }

    return this.renderModalize();
  }
}
