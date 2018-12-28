import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageStyle } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

const FixedContent = () => {
  const modal: React.RefObject<Modalize> = React.createRef();

  const renderContent = () => {
    return (
      <View style={s.content}>
        <Image
          style={s.content__icon as ImageStyle}
          source={require('../../assets/send-message.png')}
        />

        <Text style={s.content__subheading}>{'Last step'.toUpperCase()}</Text>
        <Text style={s.content__heading}>Send the message?</Text>
        <Text style={s.content__description}>{faker.lorem.paragraph()}</Text>

        <TouchableOpacity
          style={s.content__button}
          activeOpacity={0.9}
          onPress={closeModal}
        >
          <Text style={s.content__buttonText}>{'Send'.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const openModal = () => {
    if (modal.current) {
      modal.current.open();
    }
  };

  const closeModal = () => {
    if (modal.current) {
      modal.current.close();
    }
  };

  useEffect(() => {
    openModal();
  });

  return (
    <Modalize
      ref={modal}
      adjustToContentHeight
    >
      {renderContent()}
    </Modalize>
  );
}

const s = StyleSheet.create({
  content: {
    padding: 20,
  },

  content__icon: {
    width: 32,
    height: 32,

    marginBottom: 20,
  },

  content__subheading: {
    marginBottom: 2,

    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },

  content__heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },

  content__description: {
    paddingTop: 10,
    paddingBottom: 20,

    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },

  content__button: {
    paddingVertical: 15,

    width: '100%',

    backgroundColor: '#333',
    borderRadius: 6,
  },

  content__buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FixedContent;
