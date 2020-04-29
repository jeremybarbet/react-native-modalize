import React, { useRef } from 'react';
import { Animated, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import {
  ABSOLUTE_HEADER,
  FIXED_CONTENT,
  FLAT_LIST,
  SECTION_LIST,
  SIMPLE_CONTENT,
  SNAPPING_LIST,
  APPLE_MUSIC_PLAYER,
  FACEBOOK_WEBVIEW,
  SLACK_TABVIEW,
} from '../screens';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/header/Header';
import { Button } from '../components/button/Button';

import { AlwaysOpen } from './AlwaysOpen';

export const App = () => {
  const animated = useRef(new Animated.Value(0)).current;

  const handleOverlay = name => {
    Navigation.showOverlay({
      component: {
        name,
        options: {
          overlay: {
            interceptTouchOutside: true,
            handleKeyboardEvents: true,
          },
          layout: {
            componentBackgroundColor: 'transparent',
          },
        },
        passProps: {
          animated,
        },
      },
    });
  };

  const renderButtons = links => {
    return links.map((link, i) => (
      <Button key={i} onPress={() => handleOverlay(link.id)} name={link.name} />
    ));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
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
        <Header subheading="Run with React Native Navigation" />

        {renderButtons([
          { name: 'Simple content', id: SIMPLE_CONTENT },
          { name: 'Fixed content', id: FIXED_CONTENT },
          { name: 'Snapping list', id: SNAPPING_LIST },
          { name: 'Absolute header', id: ABSOLUTE_HEADER },
          { name: 'Flat List', id: FLAT_LIST },
          { name: 'Section List', id: SECTION_LIST },
          { name: 'Apple Music Player', id: APPLE_MUSIC_PLAYER },
          { name: 'Facebook WebView', id: FACEBOOK_WEBVIEW },
          { name: 'Slack TabView', id: SLACK_TABVIEW },
        ])}

        <AlwaysOpen />
      </Layout>
    </View>
  );
};
