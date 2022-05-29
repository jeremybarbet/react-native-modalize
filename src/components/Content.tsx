import React, { ForwardedRef, forwardRef, ReactNode, Ref } from 'react';
import { FlatList, LayoutChangeEvent, ScrollView, SectionList } from 'react-native';
import Animated, { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

import { useInternalProps } from '../contexts/internalPropsProvider';
import { RendererType } from '../options';
import { composeRefs } from '../utils/compose-refs';
import { constants } from '../utils/constants';
import { isIos } from '../utils/platform';

interface ContentProps {
  children: ReactNode;
  enableBounces: boolean;
  keyboardToggle: boolean;
  disableScroll?: boolean;
  beginScrollY: SharedValue<number>;
  onLayout({ nativeEvent }: LayoutChangeEvent): void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ContentComponent = <T, K>(
  { children, enableBounces, keyboardToggle, disableScroll, beginScrollY, onLayout }: ContentProps,
  ref: ForwardedRef<RendererType<T, K>>,
) => {
  const { flatListProps, sectionListProps, scrollViewProps, rendererRef } = useInternalProps();
  const keyboardDismissMode: 'interactive' | 'on-drag' = isIos ? 'interactive' : 'on-drag';
  const passedOnProps = flatListProps ?? sectionListProps ?? scrollViewProps ?? {};

  /**
   * We allow overwrites when the props (bounces, scrollEnabled) are set to false,
   * when true we use Modalize's core behavior
   */
  const bounces =
    passedOnProps?.bounces !== undefined && !passedOnProps?.bounces
      ? passedOnProps?.bounces
      : enableBounces;

  const scrollEnabled =
    passedOnProps?.scrollEnabled !== undefined && !passedOnProps?.scrollEnabled
      ? passedOnProps?.scrollEnabled
      : keyboardToggle || !disableScroll;

  const onScrollBeginDrag = useAnimatedScrollHandler(
    {
      onBeginDrag: ({ contentOffset: { y } }) => {
        beginScrollY.value = y;
      },
    },
    [beginScrollY],
  );

  const opts = {
    bounces,
    onScrollBeginDrag,
    scrollEventThrottle: constants.scrollEventThrottle,
    onLayout,
    scrollEnabled,
    keyboardDismissMode,
  };

  if (flatListProps) {
    return (
      <AnimatedFlatList
        ref={composeRefs(ref, rendererRef) as Ref<any>}
        {...flatListProps}
        {...opts}
      />
    );
  }

  if (sectionListProps) {
    return (
      <AnimatedSectionList
        ref={composeRefs(ref, rendererRef) as Ref<any>}
        {...sectionListProps}
        {...opts}
      />
    );
  }

  return (
    <AnimatedScrollView
      ref={composeRefs(ref, rendererRef) as Ref<ScrollView>}
      {...scrollViewProps}
      {...opts}
    >
      {children}
    </AnimatedScrollView>
  );
};

export const Content = forwardRef(ContentComponent);
