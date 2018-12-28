import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

import DefaultContent from './src/components/modals/DefaultContent';
import FixedContent from './src/components/modals/FixedContent';
import SnappingList from './src/components/modals/SnappingList';
import AbsoluteHeader from './src/components/modals/AbsoluteHeader';
import InputForm from './src/components/modals/InputForm';

const App = () => {
  const modal: any[] = [];

  const renderButtons = (links: string[]) => {
    return links.map((link, i) => (
      <TouchableOpacity
        key={i}
        style={s.app__button}
        onPress={() => modal[i].openModal()}
        activeOpacity={0.9}
      >
        <Text style={s.app__text}>{link}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={s.app}>
      {renderButtons([
        'Modal with a default content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with an input',
      ])}

      <View style={s.app__footer}>
        <Text style={s.app__copy}>
          Created by <Text style={s.app__author} onPress={() => Linking.openURL('https://github.com/jeremybarbet')}>Jérémy Barbet</Text> — v1.0.0-alpha.19
        </Text>
      </View>

      <DefaultContent ref={(el: DefaultContent) => { modal[0] = el; }} />
      <FixedContent ref={(el: FixedContent) => { modal[1] = el; }} />
      <SnappingList ref={(el: SnappingList) => { modal[2] = el; }} />
      <AbsoluteHeader ref={(el: AbsoluteHeader) => { modal[3] = el; }} />
      <InputForm ref={(el: InputForm) => { modal[4] = el; }} />
    </View>
  );
}

const s = StyleSheet.create({
  app: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    padding: 15,
  },

  app__button: {
    paddingVertical: 15,
    marginBottom: 15,

    width: 240,

    backgroundColor: '#333',
    borderRadius: 6,
  },

  app__text: {
    color: '#fff',
    textAlign: 'center',
  },

  app__footer: {
    position: 'absolute',
    bottom: 40,
  },

  app__copy: {
    fontSize: 12,
    color: '#b5b5b5',
  },

  app__author: {
    color: '#707070',
  },
});

export default App;
