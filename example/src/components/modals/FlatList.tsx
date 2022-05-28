import React, { forwardRef, useRef } from 'react';
import {
  Animated,
  FlatList as RNFlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { faker } from '@faker-js/faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const FlatList = forwardRef<Modalize>((_, ref) => {
  const modalizeRef = useRef<Modalize | null>(null);
  const rendererRef = useRef<RNFlatList | null>(null);
  const combinedRef = useCombinedRefs<Modalize | null>(ref, modalizeRef);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: ({ contentOffset: { y } }) => {
        scrollY.value = y;
      },
    },
    [scrollY],
  );

  const floatingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [100, 200], [0, 1], Extrapolate.CLAMP),
    transform: [
      {
        scale: interpolate(scrollY.value, [100, 150], [0.6, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  const getData = () =>
    Array(50)
      .fill(0)
      .map(_ => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
      }));

  const handleScrollToTop = () => {
    rendererRef.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  const renderFloatingComponent = () => (
    <AnimatedTouchableOpacity
      style={[s.floating, floatingStyle]}
      onPress={handleScrollToTop}
      activeOpacity={0.75}
    >
      <Text style={s.floating__text}>Top</Text>
    </AnimatedTouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={s.item}>
      <Text style={s.item__name}>{item.name}</Text>
      <Text style={s.item__email}>{item.email}</Text>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      rendererRef={rendererRef}
      FloatingComponent={renderFloatingComponent}
      flatListProps={{
        data: getData(),
        renderItem: renderItem,
        keyExtractor: item => item.email,
        showsVerticalScrollIndicator: false,
        onScroll,
      }}
    />
  );
});

const s = StyleSheet.create({
  item: {
    alignItems: 'flex-start',

    padding: 15,

    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
  },

  item__name: {
    fontSize: 16,

    marginBottom: 5,
  },

  item__email: {
    fontSize: 14,
    fontWeight: '200',
    color: '#666',
  },

  floating: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,

    position: 'absolute',
    right: 20,
    bottom: 20,

    width: 60,
    height: 60,

    borderRadius: 30,
    backgroundColor: '#333',
  },

  floating__text: {
    fontSize: 16,
    color: '#fff',
  },
});
