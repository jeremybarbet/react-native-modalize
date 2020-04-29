import { Navigation } from 'react-native-navigation';

import { App } from './App';
import { AbsoluteHeader } from './AbsoluteHeader';
import { FixedContent } from './FixedContent';
import { FlatList } from './FlatList';
import { SectionList } from './SectionList';
import { SimpleContent } from './SimpleContent';
import { SnappingList } from './SnappingList';
import { AppleMusicPlayer } from './AppleMusicPlayer';
import { FacebookWebView } from './FacebookWebView';
import { SlackTabView } from './SlackTabView';

export const Screens = new Map();

export const APP = 'reactNativeNavigationExample.App';
export const ABSOLUTE_HEADER = 'reactNativeNavigationExample.AbsoluteHeader';
export const FIXED_CONTENT = 'reactNativeNavigationExample.FixedContent';
export const FLAT_LIST = 'reactNativeNavigationExample.FlatList';
export const SECTION_LIST = 'reactNativeNavigationExample.SectionList';
export const SIMPLE_CONTENT = 'reactNativeNavigationExample.SimpleContent';
export const SNAPPING_LIST = 'reactNativeNavigationExample.SnappingList';
export const APPLE_MUSIC_PLAYER = 'reactNativeNavigationExample.AppleMusicPlayer';
export const FACEBOOK_WEBVIEW = 'reactNativeNavigationExample.FacebookWebView';
export const SLACK_TABVIEW = 'reactNativeNavigationExample.SlackTabView';

Screens.set(APP, App);
Screens.set(ABSOLUTE_HEADER, AbsoluteHeader);
Screens.set(FIXED_CONTENT, FixedContent);
Screens.set(FLAT_LIST, FlatList);
Screens.set(SECTION_LIST, SectionList);
Screens.set(SIMPLE_CONTENT, SimpleContent);
Screens.set(SNAPPING_LIST, SnappingList);
Screens.set(APPLE_MUSIC_PLAYER, AppleMusicPlayer);
Screens.set(FACEBOOK_WEBVIEW, FacebookWebView);
Screens.set(SLACK_TABVIEW, SlackTabView);

export const defaultOptions = () =>
  Navigation.setDefaultOptions({
    topBar: { visible: false },
  });

export const startApp = () => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [{ component: { name: APP } }],
      },
    },
  });
};
