import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { Host, Portal } from 'react-native-portalize';

import { Layout } from './src/components/layout/Layout';
import { Header } from './src/components/header/Header';
import { Button } from './src/components/button/Button';
import { AbsoluteHeader } from './src/components/modals/AbsoluteHeader';
import { SimpleContent } from './src/components/modals/SimpleContent';
import { FixedContent } from './src/components/modals/FixedContent';
import { SnappingList } from './src/components/modals/SnappingList';
import { FlatList } from './src/components/modals/FlatList';
import { SectionList } from './src/components/modals/SectionList';
import { AlwaysOpen } from './src/components/modals/AlwaysOpen';
import { AppleMusicPlayer } from './src/components/modals/AppleMusicPlayer';
import { FacebookWebView } from './src/components/modals/FacebookWebView';
import { SlackTabView } from './src/components/modals/SlackTabView';

export default () => {
  const modals = Array.from({ length: 8 }).map(_ => useRef(null).current);
  const animated = useRef(new Animated.Value(0)).current;

  const renderButtons = links => {
    return links.map((link, i) => <Button key={i} onPress={() => modals[i].open()} name={link} />);
  };

  return (
    <Host style={{ backgroundColor: '#000' }}>
      <Layout
        // Style here is used to create the iOS 13 modal presentation style for the AppleMusicPlayer example
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
        <Header subheading="Run with Expo" />

        {renderButtons([
          'Simple content',
          'Fixed content',
          'Snapping list',
          'Absolute header',
          'Flat List',
          'Section List',
          'Apple Music Player',
          'Facebook WebView',
          'Slack TabView',
        ])}

        <SimpleContent ref={el => (modals[0] = el)} />
        <FixedContent ref={el => (modals[1] = el)} />
        <SnappingList ref={el => (modals[2] = el)} />
        <AbsoluteHeader ref={el => (modals[3] = el)} />
        <FlatList ref={el => (modals[4] = el)} />
        <SectionList ref={el => (modals[5] = el)} />
        <Portal>
          <AppleMusicPlayer ref={el => (modals[6] = el)} animated={animated} />
        </Portal>
        <FacebookWebView ref={el => (modals[7] = el)} />
        <SlackTabView ref={el => (modals[8] = el)} />
        <AlwaysOpen />
      </Layout>
    </Host>
  );
};
