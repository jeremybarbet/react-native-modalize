import React, { useRef } from 'react';

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
import { AnimatedValue } from './src/components/modals/AnimatedValue';
import { FacebookWebView } from './src/components/modals/FacebookWebView';

export default () => {
  const modals = Array.from({ length: 8 }).map(_ => useRef(null).current);

  const renderButtons = links => {
    return links.map((link, i) => <Button key={i} onPress={() => modals[i].open()} name={link} />);
  };

  return (
    <Layout>
      <Header subheading="Run with Expo" />

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

      <SimpleContent ref={el => (modals[0] = el)} />
      <FixedContent ref={el => (modals[1] = el)} />
      <SnappingList ref={el => (modals[2] = el)} />
      <AbsoluteHeader ref={el => (modals[3] = el)} />
      <FlatList ref={el => (modals[4] = el)} />
      <SectionList ref={el => (modals[5] = el)} />
      <AnimatedValue ref={el => (modals[6] = el)} />
      <FacebookWebView ref={el => (modals[7] = el)} />
      <AlwaysOpen />
    </Layout>
  );
};
