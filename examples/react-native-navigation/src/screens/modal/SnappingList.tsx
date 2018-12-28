import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

const SnappingList = () => {
  const modal: React.RefObject<Modalize> = React.createRef();

  const renderHeader = () => (
    <View style={s.modal__header}>
      <Text style={s.modal__headerText}>50 users online</Text>
    </View>
  );

  const renderContent = () => (
    <View style={s.content}>
      {[...Array(50).keys()].map((_, i) => (
        <View style={s.content__row} key={i}>
          <View style={s.content__avatar}>
            <Image
              style={{ width: '100%', height: '100%' }}
              source={{ uri: faker.image.avatar() }}
            />
          </View>

          <Text style={s.content__name}>{faker.name.findName()}</Text>
        </View>
      ))}
    </View>
  );

  const openModal = () => {
    if (modal.current) {
      modal.current.open();
    }
  };

  useEffect(() => {
    openModal();
  });

  return (
    <Modalize
      ref={modal}
      header={{
        component: renderHeader,
        isAbsolute: false,
      }}
      height={350}
    >
      {renderContent()}
    </Modalize>
  );
}

const s = StyleSheet.create({
  modal__header: {
    paddingVertical: 15,
    marginHorizontal: 15,

    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },

  modal__headerText: {
    fontSize: 15,
    fontWeight: '200',
  },

  content: {
    paddingHorizontal: 15,
  },

  content__row: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 15,

    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
  },

  content__avatar: {
    width: 38,
    height: 38,

    marginRight: 15,

    overflow: 'hidden',

    backgroundColor: '#eee',
    borderRadius: 19,
  },

  content__name: {
    fontSize: 16,
  },
});

export default SnappingList;
