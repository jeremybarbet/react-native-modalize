import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import DefaultContent from './modals/DefaultContent';
import SnapingList from './modals/SnapingList';
import FixedContent from './modals/FixedContent';

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
          'Modal with a snaping list',
        ])}

        <DefaultContent ref={(el: DefaultContent) => { this.modal[0] = el; }} />
        <FixedContent ref={(el: FixedContent) => { this.modal[1] = el; }} />
        <SnapingList ref={(el: SnapingList) => { this.modal[2] = el; }} />
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

    width: 220,

    backgroundColor: '#333',
    borderRadius: 6,
  },

  app__text: {
    color: '#fff',
    textAlign: 'center',
  },
});
