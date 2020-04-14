import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

export const AbsoluteHeader = ({ componentId }) => {
  const modalRef = useRef(null);

  const onClosed = () => {
    Navigation.dismissOverlay(componentId);
  };

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.open();
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  const renderHeader = () => (
    <TouchableOpacity
      style={s.modal__header}
      activeOpacity={0.75}
      onPress={closeModal}
      hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
    >
      <Image
        source={{
          uri:
            'https://flaticons.net/icon.php?slug_category=mobile-application&slug_icon=close&icon_size=256&icon_color=FFFFFF&icon_flip=&icon_rotate=0',
        }}
        style={{ width: '40%', height: '40%' }}
      />
    </TouchableOpacity>
  );

  renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__heading}>Article title</Text>
      <Text style={s.content__subheading}>November 11st 2018</Text>
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(10)}</Text>
    </View>
  );

  useEffect(() => {
    openModal();
  }, []);

  return (
    <Modalize ref={modalRef} HeaderComponent={renderHeader} withHandle={false} onClosed={onClosed}>
      {renderContent()}
    </Modalize>
  );
};

const s = StyleSheet.create({
  modal__header: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,

    alignItems: 'center',
    justifyContent: 'center',

    width: 25,
    height: 25,

    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
  },

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
