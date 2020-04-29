import React, { useState, useRef, forwardRef, memo } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import { TabView, SceneMap } from 'react-native-tab-view';
import faker from 'faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';

const { width } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';
const HEADER_COLLAPSE = 32;
const HEADER_LIST = 60;
const HEADER_HEIGHT = HEADER_LIST + HEADER_COLLAPSE;

const ROUTES = [
  { key: 'first', title: 'First', emoji: '❤️', number: 27 },
  { key: 'second', title: 'Second', emoji: '✨', number: 22 },
  { key: 'third', title: 'Third', emoji: '🔥', number: 15 },
  { key: 'fourth', title: 'Fourth', emoji: '💕', number: 12 },
  { key: 'fifth', title: 'Fifth', emoji: '💯', number: 9 },
  { key: 'sixth', title: 'Sixth', emoji: '🙌🏻', number: 7 },
  { key: 'seventh', title: 'Seventh', emoji: '🐶', number: 6 },
];

const Item = memo(({ active, emoji, number, onPress }) => (
  <TouchableOpacity style={s.item} onPress={onPress} activeOpacity={0.75}>
    <Text style={s.item__emoji}>{emoji}</Text>
    <Text style={[s.item__copy, { color: active ? '#1d9bd0' : '#d1d2d2' }]}>{number}</Text>
    {active && <View style={s.item__line} />}
  </TouchableOpacity>
));

const Row = memo(() => (
  <View style={s.row}>
    <Image style={s.row__avatar} source={{ uri: faker.image.avatar() }} />

    <View style={s.row__info}>
      <Text style={s.row__name}>{faker.name.firstName()}</Text>
      <Text style={s.row__position}>{faker.name.jobTitle()}</Text>
    </View>
  </View>
));

const Route = ({ route }) => {
  const { number } = ROUTES.find(r => r.key === route.key);

  return (
    <View style={s.route}>
      {Array(number)
        .fill(0)
        .map((_, index) => (
          <Row key={index} />
        ))}
    </View>
  );
};

const Tabs = memo(({ active, onIndexChange }) => {
  const renderScene = SceneMap({
    first: Route,
    second: Route,
    third: Route,
    fourth: Route,
    fifth: Route,
    sixth: Route,
    seventh: Route,
  });

  return (
    <TabView
      navigationState={{ index: active, routes: ROUTES }}
      renderTabBar={() => null}
      renderScene={renderScene}
      onIndexChange={onIndexChange}
      initialLayout={{ width }}
      sceneContainerStyle={{ top: HEADER_HEIGHT }}
    />
  );
});

export const SlackTabView = forwardRef((_, ref) => {
  const modalizeRef = useRef(null);
  const contentRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalizeRef);
  const scrollViewRef = useRef(null);
  const [index, setIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleIndexChange = i => {
    const w = 55; // item width
    const m = 25; // item margin
    const x = (w + m) * i;

    setIndex(i);

    if (contentRef.current) {
      // Old version of react-native, we need to use getNode()
      contentRef.current.getNode().scrollTo({ y: 0, animated: true });
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x, animated: true });
    }
  };

  const renderTabBar = (
    <View style={s.tabbar}>
      <Animated.View
        style={[
          s.tabbar__wrapper,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -HEADER_COLLAPSE],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <View style={s.tabbar__heading}>
          <Text style={s.tabbar__headingText}>List of reactions</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={s.tabbar__list}
          contentContainerStyle={s.tabbar__listContent}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
        >
          {ROUTES.map(({ emoji, number }, i) => (
            <Item
              key={i}
              active={index === i}
              emoji={emoji}
              number={number}
              onPress={() => handleIndexChange(i)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      contentRef={contentRef}
      HeaderComponent={renderTabBar}
      modalStyle={{ backgroundColor: '#1a1d21' }}
      handleStyle={{ width: 35, backgroundColor: '#75777a' }}
      childrenStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' }}
      scrollViewProps={{
        onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        }),
        scrollEventThrottle: 16,
      }}
    >
      <Tabs active={index} onIndexChange={handleIndexChange} />
    </Modalize>
  );
});

const s = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9000,

    height: HEADER_HEIGHT,

    overflow: 'hidden',

    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  tabbar__wrapper: {
    position: 'absolute',

    width: '100%',
    height: '100%',
  },

  tabbar__heading: {
    paddingTop: 9,

    height: HEADER_COLLAPSE,

    backgroundColor: '#212428',
  },

  tabbar__headingText: {
    marginLeft: 20,

    fontSize: 12,
    letterSpacing: 0.25,
    textTransform: 'uppercase',

    color: '#d1d2d2',
  },

  tabbar__list: {
    height: HEADER_LIST,

    borderTopColor: '#313437',
    borderTopWidth: 1,
    borderBottomColor: '#313437',
    borderBottomWidth: 1,

    backgroundColor: '#1a1d21',
  },

  tabbar__listContent: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingLeft: 20,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 25,

    height: '100%',
  },

  item__emoji: {
    fontSize: 22,
  },

  item__copy: {
    marginLeft: 4,

    fontSize: 14,

    color: '#d1d2d2',
  },

  item__line: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,

    height: 3,

    backgroundColor: '#1d9bd0',
  },

  route: {
    flex: 1,

    paddingTop: 12,
    paddingBottom: isAndroid ? 100 : 40,

    backgroundColor: '#1a1d21',
  },

  row: {
    flexDirection: 'row',

    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  row__avatar: {
    width: 36,
    height: 36,

    borderRadius: 8,
    backgroundColor: '#3b4149',
  },

  row__info: {
    marginLeft: 20,
  },

  row__name: {
    marginBottom: 2,

    fontSize: 16,
    fontWeight: '500',

    color: '#d1d2d2',
  },

  row__position: {
    fontSize: 14,

    color: '#9a9c9d',
  },
});
