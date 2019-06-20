import React from 'react';
import { Navigation } from 'react-native-navigation';

import { ABSOLUTE_HEADER, CUSTOM_STYLE, FIXED_CONTENT, FLAT_LIST, SECTION_LIST, SIMPLE_CONTENT, SNAPPING_LIST } from '../screens';
import { Layout } from '../components/layout/Layout';
import { Header } from '../components/header/Header';
import { Button } from '../components/button/Button';

import { AlwaysOpen } from './AlwaysOpen';

export const App = () => {
  const handleOverlay = (name) => {
    Navigation.showOverlay({
      component: {
        name,
        options: { overlay: { interceptTouchOutside: true } },
      },
    });
  };

  const renderButtons = (links) => {
    return links.map((link, i) => (
      <Button
        key={i}
        onPress={() => handleOverlay(link.id)}
        name={link.name}
      />
    ));
  };

  return (
    <Layout>
      <Header subheading="Run with React Native Navigation" />

      {renderButtons([
        { name: 'Modal with a simple content', id: SIMPLE_CONTENT },
        { name: 'Modal with a fixed content', id: FIXED_CONTENT },
        { name: 'Modal with a snapping list', id: SNAPPING_LIST },
        { name: 'Modal with an absolute header', id: ABSOLUTE_HEADER },
        { name: 'Modal with custom style', id: CUSTOM_STYLE },
        { name: 'Modal with a Flat List', id: FLAT_LIST },
        { name: 'Modal with a Section List', id: SECTION_LIST },
      ])}

      <AlwaysOpen />
    </Layout>
  );
};
