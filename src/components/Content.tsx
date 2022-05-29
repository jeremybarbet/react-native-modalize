import React, { ForwardedRef, forwardRef, LegacyRef, ReactNode } from 'react';
import { LayoutChangeEvent, SectionList } from 'react-native';
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

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

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
      <Animated.FlatList
        ref={composeRefs(ref, rendererRef) as LegacyRef<Animated.FlatList<T>>}
        {...flatListProps}
        {...opts}
      />
    );
  }

  if (sectionListProps) {
    return (
      <AnimatedSectionList
        ref={composeRefs(ref, rendererRef) as LegacyRef<any>}
        {...sectionListProps}
        {...opts}
      />
    );
  }

  return (
    <Animated.ScrollView
      ref={composeRefs(ref, rendererRef) as LegacyRef<Animated.ScrollView>}
      {...scrollViewProps}
      {...opts}
    >
      {children}
    </Animated.ScrollView>
  );
};

export const Content = forwardRef(ContentComponent);
