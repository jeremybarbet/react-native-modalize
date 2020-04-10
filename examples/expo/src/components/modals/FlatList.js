import React, { useRef, forwardRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';

export const FlatList = forwardRef((_, ref) => {
  const modalRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalRef);

  const getData = () =>
    Array(50)
      .fill(0)
      .map(_ => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
      }));

  const scrollToTop = () => {
    if (combinedRef.current) {
      combinedRef.current.scrollTo({
        y: 0,
        animated: true,
      });
    }
  };

  const renderFloatingComponent = () => (
    <TouchableOpacity style={s.floating} onPress={scrollToTop} activeOpacity={0.75}>
      <Text style={s.floating__text}>Top</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={s.item}>
      <Text style={s.item__name}>{item.name}</Text>
      <Text style={s.item__email}>{item.email}</Text>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      FloatingComponent={renderFloatingComponent}
      flatListProps={{
        data: getData(),
        renderItem: renderItem,
        keyExtractor: item => item.email,
        showsVerticalScrollIndicator: false,
      }}
    />
  );
});

const s = StyleSheet.create({
  item: {
    alignItems: 'flex-start',

    padding: 15,

    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
  },

  item__name: {
    fontSize: 16,

    marginBottom: 5,
  },

  item__email: {
    fontSize: 14,
    fontWeight: '200',
    color: '#666',
  },

  floating: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,

    position: 'absolute',
    right: 20,
    bottom: 20,

    width: 60,
    height: 60,

    borderRadius: 30,
    backgroundColor: '#333',
  },

  floating__text: {
    fontSize: 16,
    color: '#fff',
  },
});
