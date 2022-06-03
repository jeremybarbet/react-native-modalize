import React, { forwardRef, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Modalize, Position } from 'react-native-modalize';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useCombinedRefs } from '../../utils/use-combined-refs';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;

export const AppleMusicPlayer = forwardRef<Modalize>((_, ref) => {
  const modalizeRef = useRef<Modalize | null>(null);
  const combinedRef = useCombinedRefs<Modalize | null>(ref, modalizeRef);
  const animated = useSharedValue(0);
  const [handle, setHandle] = useState(false);

  const coverStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(animated.value, [0, 1], [0.2, 0.35]),
    transform: [
      {
        scale: interpolate(animated.value, [0, 1], [0.18, 1], Extrapolate.CLAMP),
      },
      {
        translateX: interpolate(animated.value, [0, 0.25, 1], [0, 100, 140], Extrapolate.CLAMP),
      },
      {
        translateY: interpolate(animated.value, [0, 0.25, 1], [0, 100, 165], Extrapolate.CLAMP),
      },
    ],
  }));

  const assetStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(animated.value, [0, 1], [32, 8]),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animated.value, [0, 0.75], [1, 0]),
  }));

  const innerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animated.value, [0, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(animated.value, [0, 1], [-300, 0]),
      },
    ],
  }));

  const handlePositionChange = (position: Position) => {
    setHandle(position === 'top');
  };

  return (
    <Modalize
      ref={combinedRef}
      panGestureSharedValue={animated}
      snapPoint={HEADER_HEIGHT}
      withHandle={handle}
      handlePosition="inside"
      handleStyle={{ top: 13, width: 40, height: handle ? 6 : 0, backgroundColor: '#bcc0c1' }}
      onPositionChange={handlePositionChange}
    >
      <Animated.View style={[s.content__cover, coverStyle]}>
        <Animated.Image
          style={[s.content__asset, assetStyle]}
          source={{
            uri: 'https://images.genius.com/7ea34ad2fa694fb706de3e81dc1588c4.1000x1000x1.jpg',
          }}
        />
      </Animated.View>

      <Animated.View style={[s.content__header, headerStyle]}>
        <Text style={s.content__title}>Your Design</Text>

        <TouchableOpacity activeOpacity={0.75}>
          <Image style={{ marginRight: 30 }} source={require('../../../assets/pause.png')} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.75}>
          <Image source={require('../../../assets/forward.png')} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.Image
        style={[s.content__inner, innerStyle]}
        resizeMode="contain"
        source={require('../../../assets/inner-player.png')}
      />
    </Modalize>
  );
});

const s = StyleSheet.create({
  content__header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: HEADER_HEIGHT,

    paddingHorizontal: 30,
    paddingBottom: 5,
  },

  content__cover: {
    zIndex: 100,

    marginTop: -132,
    marginLeft: -115,

    width: width - 50,
    height: 360,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },

  content__asset: {
    width: '100%',
    height: '100%',
  },

  content__title: {
    paddingLeft: 90,
    marginRight: 'auto',

    fontSize: 18,
  },

  content__inner: {
    top: 200,
    left: 30,

    width: width - 60,
  },
});
