import React from 'react';

import { Layout } from './src/layout/Layout';
import { Header } from './src/header/Header';
import { Footer } from './src/footer/Footer';
import { Button } from './src/button/Button';
import { AbsoluteHeader } from './src/modals/AbsoluteHeader';
import { SimpleContent } from './src/modals/SimpleContent';
import { FixedContent } from './src/modals/FixedContent';
import { SnappingList } from './src/modals/SnappingList';
import { CustomStyle } from './src/modals/CustomStyle';
import { FlatList } from './src/modals/FlatList';
import { SectionList } from './src/modals/SectionList';

const App = () => {
  const modal = [];

  const renderButtons = (links) => {
    return links.map((link, i) => (
      <Button
        key={i}
        onPress={() => modal[i].openModal()}
        name={link}
      />
    ));
  };

  return (
    <Layout>
      <Header
        subheading="Run with Expo"
        copy="Simple example without any navigation"
      />

      {renderButtons([
        'Modal with a simple content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with custom style',
        'Modal with a Flat List',
        'Modal with a Section List',
      ])}

      <Footer />

      <SimpleContent ref={el => { modal[0] = el; }} />
      <FixedContent ref={el => { modal[1] = el; }} />
      <SnappingList ref={el => { modal[2] = el; }} />
      <AbsoluteHeader ref={el => { modal[3] = el; }} />
      <CustomStyle ref={el => { modal[4] = el; }} />
      <FlatList ref={el => { modal[5] = el; }} />
      <SectionList ref={el => { modal[6] = el; }} />
    </Layout>
  );
}

export default App;
