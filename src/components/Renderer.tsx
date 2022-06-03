import React, { ForwardedRef, forwardRef, ReactNode, Ref } from 'react';
import { FlatList, LayoutChangeEvent, ScrollView, SectionList } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';

import { useInternalLogic } from '../contexts/InternalLogicProvider';
import { useInternalProps } from '../contexts/InternalPropsProvider';
import { RendererType } from '../options';
import { composeRefs } from '../utils/compose-refs';
import { constants } from '../utils/constants';
import { isIos } from '../utils/platform';

interface RendererProps {
  children: ReactNode;
  onLayout({ nativeEvent }: LayoutChangeEvent): void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const RendererComponent = <T, K>(
  { children, onLayout }: RendererProps,
  ref: ForwardedRef<RendererType<T, K>>,
) => {
  const { flatListProps, sectionListProps, scrollViewProps, rendererRef } = useInternalProps();
  const { enableBounces, keyboardToggle, disableScroll, beginDragY } = useInternalLogic();
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
      onBeginDrag: ({ contentOffset }) => {
        beginDragY.value = contentOffset.y;
      },
    },
    [beginDragY],
  );

  const opts = {
    bounces,
    scrollEnabled,
    keyboardDismissMode,
    scrollEventThrottle: constants.scrollEventThrottle,
    onScrollBeginDrag,
    onLayout,
  };

  if (flatListProps) {
    return (
      <AnimatedFlatList
        ref={composeRefs(ref, rendererRef) as Ref<FlatList>}
        {...flatListProps}
        {...opts}
      />
    );
  }

  if (sectionListProps) {
    return (
      <AnimatedSectionList
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore SectionList type is not working with latest reanimated
        ref={composeRefs(ref, rendererRef) as Ref<SectionList>}
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

export const Renderer = forwardRef(RendererComponent);
