import React, { useRef } from 'react';

import { Layout } from './src/components/layout/Layout';
import { Header } from './src/components/header/Header';
import { Button } from './src/components/button/Button';
import { AbsoluteHeader } from './src/components/modals/AbsoluteHeader';
import { SimpleContent } from './src/components/modals/SimpleContent';
import { FixedContent } from './src/components/modals/FixedContent';
import { SnappingList } from './src/components/modals/SnappingList';
import { CustomStyle } from './src/components/modals/CustomStyle';
import { FlatList } from './src/components/modals/FlatList';
import { SectionList } from './src/components/modals/SectionList';
import { AlwaysOpen } from './src/components/modals/AlwaysOpen';
import { AnimatedValue } from './src/components/modals/AnimatedValue';

export default () => {
  const modals = Array.from({ length: 8 }).map(_ => useRef(null).current);

  const renderButtons = links => {
    return links.map((link, i) => <Button key={i} onPress={() => modals[i].open()} name={link} />);
  };

  return (
    <Layout>
      <Header subheading="Run with Expo" />

      {renderButtons([
        'Modal with a simple content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with custom style',
        'Modal with a Flat List',
        'Modal with a Section List',
        'Modal with an Animated Value',
      ])}

      <SimpleContent ref={el => (modals[0] = el)} />
      <FixedContent ref={el => (modals[1] = el)} />
      <SnappingList ref={el => (modals[2] = el)} />
      <AbsoluteHeader ref={el => (modals[3] = el)} />
      <CustomStyle ref={el => (modals[4] = el)} />
      <FlatList ref={el => (modals[5] = el)} />
      <SectionList ref={el => (modals[6] = el)} />
      <AnimatedValue ref={el => (modals[7] = el)} />
      {/* <AlwaysOpen /> */}
    </Layout>
  );
};
