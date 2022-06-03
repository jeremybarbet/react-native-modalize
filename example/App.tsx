import React, { useRef } from 'react';
import { Modalize } from 'react-native-modalize';

import { Button } from './src/components/button/Button';
import { Header } from './src/components/header/Header';
import { Layout } from './src/components/layout/Layout';
import { AbsoluteHeader } from './src/components/modals/AbsoluteHeader';
import { AlwaysOpen } from './src/components/modals/AlwaysOpen';
import { AppleMusicPlayer } from './src/components/modals/AppleMusicPlayer';
import { FacebookWebView } from './src/components/modals/FacebookWebView';
import { FixedContent } from './src/components/modals/FixedContent';
import { FlatList } from './src/components/modals/FlatList';
import { SectionList } from './src/components/modals/SectionList';
import { SimpleContent } from './src/components/modals/SimpleContent';
import { SlackTabView } from './src/components/modals/SlackTabView';
import { SnappingList } from './src/components/modals/SnappingList';

export default () => {
  const modals = Array.from({ length: 9 }).map(_ => useRef<Modalize | null>(null));

  const renderButtons = (links: string[]) =>
    links.map((link, i) => (
      <Button key={i} onPress={() => modals?.[i].current?.open()} name={link} />
    ));

  return (
    <Layout>
      <Header />

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

      <SimpleContent ref={el => (modals[0].current = el)} />
      <FixedContent ref={el => (modals[1].current = el)} />
      <SnappingList ref={el => (modals[2].current = el)} />
      <AbsoluteHeader ref={el => (modals[3].current = el)} />
      <FlatList ref={el => (modals[4].current = el)} />
      <SectionList ref={el => (modals[5].current = el)} />
      <AppleMusicPlayer ref={el => (modals[6].current = el)} />
      <FacebookWebView ref={el => (modals[7].current = el)} />
      <SlackTabView ref={el => (modals[8].current = el)} />
      {/* <AlwaysOpen /> */}
    </Layout>
  );
};
