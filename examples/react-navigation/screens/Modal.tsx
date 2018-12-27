import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import Footer from '../components/footer/Footer';

import DefaultContent from '../modals/DefaultContent';
import FixedContent from '../modals/FixedContent';
import SnappingList from '../modals/SnappingList';
import AbsoluteHeader from '../modals/AbsoluteHeader';
import InputForm from '../modals/InputForm';

const ModalScreen = () => {
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
  }

  return (
    <View style={s.app}>
      {renderButtons([
        'Modal with a default content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with an input',
      ])}

      <Footer />
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

    backgroundColor: '#fafafa',
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
});

export default ModalScreen;
