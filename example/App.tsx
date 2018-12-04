import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

import DefaultContent from './modals/DefaultContent';
import FixedContent from './modals/FixedContent';
import SnappingList from './modals/SnappingList';
import AbsoluteHeader from './modals/AbsoluteHeader';

export default class App extends React.PureComponent {

  modal: any[] = [];

  renderButtons = (links: string[]) => {
    return links.map((link, i) => (
      <TouchableOpacity
        key={i}
        style={s.app__button}
        onPress={() => this.modal[i].openModal()}
        activeOpacity={0.9}
      >
        <Text style={s.app__text}>{link}</Text>
      </TouchableOpacity>
    ));
  }

  render() {
    return (
      <View style={s.app}>
        {this.renderButtons([
          'Modal with a default content',
          'Modal with a fixed content',
          'Modal with a snapping list',
          'Modal with an absolute header',
        ])}

        <DefaultContent ref={(el: DefaultContent) => { this.modal[0] = el; }} />
        <FixedContent ref={(el: FixedContent) => { this.modal[1] = el; }} />
        <SnappingList ref={(el: SnappingList) => { this.modal[2] = el; }} />
        <AbsoluteHeader ref={(el: AbsoluteHeader) => { this.modal[3] = el; }} />

        <View style={s.app__footer}>
          <Text style={s.app__copy}>Created by <Text style={s.app__author} onPress={() => Linking.openURL('https://github.com/jeremybarbet')}>Jérémy Barbet</Text> — v1.0.0-alpha.8</Text>
        </View>
      </View>
    );
  }
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
