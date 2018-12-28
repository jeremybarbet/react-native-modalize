import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

const DefaultContent = () => {
  const modal: React.RefObject<Modalize> = React.createRef();

  const renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__heading}>Article title</Text>
      <Text style={s.content__subheading}>November 11st 2018</Text>
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(8)}</Text>
    </View>
  );

  const openModal = () => {
    if (modal.current) {
      modal.current.open();
    }
  };

  return (
    <Modalize ref={modal}>
      {renderContent()}
    </Modalize>
  );
}

const s = StyleSheet.create({
  content: {
    padding: 15,
  },

  content__heading: {
    marginBottom: 2,

    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },

  content__subheading: {
    marginBottom: 20,

    fontSize: 16,
    color: '#ccc',
  },

  content__paragraph: {
    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },
});

export default DefaultContent;
