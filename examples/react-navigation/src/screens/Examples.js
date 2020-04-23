import React, { useRef } from 'react';
import { View, Animated } from 'react-native';
import { Portal } from 'react-native-portalize';

import { Layout } from '../components/layout/Layout';
import { Header } from '../components/header/Header';
import { Button } from '../components/button/Button';
import { AbsoluteHeader } from '../components/modals/AbsoluteHeader';
import { SimpleContent } from '../components/modals/SimpleContent';
import { FixedContent } from '../components/modals/FixedContent';
import { SnappingList } from '../components/modals/SnappingList';
import { FlatList } from '../components/modals/FlatList';
import { SectionList } from '../components/modals/SectionList';
import { AlwaysOpen } from '../components/modals/AlwaysOpen';
import { AnimatedValue } from '../components/modals/AnimatedValue';
import { FacebookWebView } from '../components/modals/FacebookWebView';

export const ExamplesScreen = () => {
  const modals = Array.from({ length: 8 }).map(_ => useRef(null).current);
  const animated = useRef(new Animated.Value(0)).current;

  const renderButtons = links => {
    return links.map((link, i) => <Button key={i} onPress={() => modals[i].open()} name={link} />);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Layout
        style={{
          borderRadius: animated.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
          transform: [
            {
              scale: animated.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }),
            },
          ],
          opacity: animated.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }),
        }}
      >
        <Header subheading="Run with React Navigation" />

        {renderButtons([
          'Simple content',
          'Fixed content',
          'Snapping list',
          'Absolute header',
          'Flat List',
          'Section List',
          'Animated Value',
          'Facebook WebView',
        ])}

        <Portal>
          <SimpleContent ref={el => (modals[0] = el)} />
          <FixedContent ref={el => (modals[1] = el)} />
          <SnappingList ref={el => (modals[2] = el)} />
          <AbsoluteHeader ref={el => (modals[3] = el)} />
          <FlatList ref={el => (modals[4] = el)} />
          <SectionList ref={el => (modals[5] = el)} />
          <AnimatedValue ref={el => (modals[6] = el)} animated={animated} />
          <FacebookWebView ref={el => (modals[7] = el)} />
          <AlwaysOpen />
        </Portal>
      </Layout>
    </View>
  );
};
