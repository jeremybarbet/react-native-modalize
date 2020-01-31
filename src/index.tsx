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
} from 'react-native-gesture-handler';

import { IProps, IState } from './options';
import { getSpringConfig, isIphoneX, isIos, hasAbsoluteStyle } from './utils';
import s from './styles';

const { height: screenHeight } = Dimensions.get('window');
const AnimatedKeyboardAvoidingView = Animated.createAnimatedComponent(KeyboardAvoidingView);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const THRESHOLD = 150;

export class Modalize<FlatListItem = any, SectionListItem = any> extends React.Component<
  IProps<FlatListItem, SectionListItem>,
  IState
> {
  static defaultProps = {
    handlePosition: 'outside',
    useNativeDriver: true,
    adjustToContentHeight: false,
    avoidKeyboardLikeIOS: Platform.select({
      ios: true,
      android: false,
    }),
    modalTopOffset: Platform.select({
      ios: 0,
      android: StatusBar.currentHeight || 0,
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
  private contentAlreadyCalculated: boolean = false;
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
    };

    this.beginScrollY.addListener(({ value }) => (this.beginScrollYValue = value));
    this.reverseBeginScrollY = Animated.multiply(new Animated.Value(-1), this.beginScrollY);
  }

  componentDidMount() {
    if (this.props.alwaysOpen) {
      this.onAnimateOpen(this.props.alwaysOpen);
    }

    Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
    Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidShow', this.onKeyboardShow);
    Keyboard.removeListener('keyboardDidHide', this.onKeyboardHide);
  }

  public open = (): void => {
    const { adjustToContentHeight, onOpen } = this.props;

    if (onOpen) {
      onOpen();
    }

    if (!adjustToContentHeight || this.contentAlreadyCalculated) {
      this.onAnimateOpen();
    } else {
      this.setState({ isVisible: true });
    }
  };

  public close = (dest: 'alwaysOpen' | 'default' = 'default'): void => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.onAnimateClose(dest);
  };

  public scrollTo = (...args: Parameters<ScrollView['scrollTo']>): void => {
    if (this.contentView.current) {
      (this.contentView.current as any).getNode().scrollTo(...args);
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

  private onAnimateOpen = (alwaysOpen?: number): void => {
    const { onOpened, snapPoint, useNativeDriver, openAnimationConfig } = this.props;
    const { timing, spring } = openAnimationConfig!;
    const { overlay, modalHeight } = this.state;
    const toValue = alwaysOpen
      ? (modalHeight || 0) - alwaysOpen
      : snapPoint
      ? (modalHeight || 0) - snapPoint
      : 0;

    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    this.setState({
      isVisible: true,
      showContent: true,
    });

    Animated.parallel([
      Animated.timing(overlay, {
        toValue: alwaysOpen ? 0 : 1,
        duration: timing.duration,
        easing: Easing.ease,
        useNativeDriver,
      }),

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
    });
  };

  private onAnimateClose = (dest: 'alwaysOpen' | 'default' = 'default'): void => {
    const { onClosed, useNativeDriver, snapPoint, closeAnimationConfig, alwaysOpen } = this.props;
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
    const { adjustToContentHeight, snapPoint, alwaysOpen } = this.props;
    const { contentHeight, modalHeight } = this.state;

    if (
      !adjustToContentHeight ||
      (modalHeight || 0) <= nativeEvent.layout.height ||
      snapPoint ||
      this.contentAlreadyCalculated
    ) {
      if ((modalHeight || 0) <= nativeEvent.layout.height) {
        this.onAnimateOpen(alwaysOpen);
      }

      return;
    }

    // @todo: modalHeight should be equal to the nativeEvent's height,
    // and not to the state's value which is 0 at the first mount
    this.setState(
      {
        contentHeight: nativeEvent.layout.height || contentHeight,
      },
      () => {
        this.contentAlreadyCalculated = true;
        this.onAnimateOpen();
      },
    );
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
    }
  };

  private onHandleOverlay = ({ nativeEvent }: TapGestureHandlerStateChangeEvent): void => {
    if (nativeEvent.oldState === State.ACTIVE && !this.willCloseModalize) {
      this.close();
    }
  };

  private onBackPress = async (): Promise<boolean> => {
    const { onBackButtonPress, alwaysOpen } = this.props;

    if (alwaysOpen) {
      return false;
    }

    if (onBackButtonPress) {
      onBackButtonPress();
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

  private renderComponent = (Tag: React.ReactNode): React.ReactNode => {
    return React.isValidElement(Tag) ? (
      Tag
    ) : (
      // @ts-ignore
      <Tag />
    );
  };

  private renderHandle = (): React.ReactNode => {
    const { handleStyle, useNativeDriver, withHandle, panGestureEnabled } = this.props;
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
        onGestureEvent={Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
          useNativeDriver,
        })}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View style={handleStyles}>
          <View style={shapeStyles} />
        </Animated.View>
      </PanGestureHandler>
    );
  };

  private renderHeader = (): React.ReactNode => {
    const { useNativeDriver, HeaderComponent, panGestureEnabled } = this.props;

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
        onGestureEvent={Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
          useNativeDriver,
        })}
        onHandlerStateChange={this.onHandleComponent}
      >
        <Animated.View style={s.component}>{this.renderComponent(HeaderComponent)}</Animated.View>
      </PanGestureHandler>
    );
  };

  private renderContent = (): React.ReactNode => {
    const { children, scrollViewProps, flatListProps, sectionListProps } = this.props;
    const { enableBounces } = this.state;
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
    };

    if (flatListProps) {
      return <AnimatedFlatList {...opts} {...flatListProps} />;
    }

    if (sectionListProps) {
      return <AnimatedSectionList {...opts} {...sectionListProps} />;
    }

    return (
      <Animated.ScrollView {...opts} {...scrollViewProps} keyboardDismissMode={keyboardDismissMode}>
        {children}
      </Animated.ScrollView>
    );
  };

  private renderChildren = (): React.ReactNode => {
    const { useNativeDriver, adjustToContentHeight, panGestureEnabled } = this.props;

    return (
      <PanGestureHandler
        ref={this.modalChildren}
        enabled={panGestureEnabled}
        simultaneousHandlers={[this.modalContentView, this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
          useNativeDriver,
        })}
        minDist={20}
        activeOffsetY={20}
        activeOffsetX={20}
        onHandlerStateChange={this.onHandleChildren}
      >
        <Animated.View
          style={!adjustToContentHeight ? s.content__container : s.content__adjustHeight}
        >
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

  private renderOverlay = (): React.ReactNode => {
    const {
      useNativeDriver,
      overlayStyle,
      alwaysOpen,
      panGestureEnabled,
      closeOnOverlayTap,
    } = this.props;
    const { showContent } = this.state;
    const pointerEvents = alwaysOpen ? 'box-none' : 'auto';

    return (
      <PanGestureHandler
        ref={this.modalOverlay}
        enabled={panGestureEnabled}
        simultaneousHandlers={[this.modal]}
        shouldCancelWhenOutside={false}
        onGestureEvent={Animated.event([{ nativeEvent: { translationY: this.dragY } }], {
          useNativeDriver,
        })}
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
    } = this.props;
    const { isVisible, lastSnap, showContent } = this.state;
    const pointerEvents = alwaysOpen ? 'box-none' : 'auto';

    const keyboardAvoidingViewProps: KeyboardAvoidingViewProps = {
      keyboardVerticalOffset: keyboardAvoidingOffset,
      behavior: keyboardAvoidingBehavior || 'padding',
      enabled: avoidKeyboardLikeIOS,
      style: [s.modalize__content, this.modalizeContent, modalStyle],
    };

    if (!avoidKeyboardLikeIOS) {
      keyboardAvoidingViewProps.onLayout = this.onModalizeContentLayout;
    }

    if (!isVisible) {
      return null;
    }

    return (
      <View style={s.modalize} pointerEvents={pointerEvents}>
        <TapGestureHandler
          ref={this.modal}
          maxDurationMs={100000}
          maxDeltaY={lastSnap}
          enabled={Platform.select({
            ios: false,
            android: panGestureEnabled,
          })}
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
      </View>
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
