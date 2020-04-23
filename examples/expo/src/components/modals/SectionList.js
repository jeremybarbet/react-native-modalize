import React, { useRef, forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';

export const SectionList = forwardRef((_, ref) => {
  const modalizeRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalizeRef);

  const getSections = () => [
    {
      title: 'January 2019',
      data: Array(10)
        .fill(0)
        .map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
    },
    {
      title: 'December 2018',
      data: Array(12)
        .fill(0)
        .map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
    },
    {
      title: 'November 2018',
      data: Array(4)
        .fill(0)
        .map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
    },
  ];

  const renderItem = ({ item }) => (
    <View style={s.item}>
      <Text style={s.item__product}>{item.product}</Text>
      <Text style={s.item__price}>{item.price}€</Text>
    </View>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={s.header}>
      <Text style={s.header__name}>{section.title.toUpperCase()}</Text>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      childrenStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' }}
      sectionListProps={{
        sections: getSections(),
        renderItem: renderItem,
        renderSectionHeader: renderSectionHeader,
        keyExtractor: (item, index) => `${item.title}-${index}`,
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

  item__product: {
    fontSize: 16,

    marginBottom: 5,
  },

  item__price: {
    fontSize: 14,
    fontWeight: '200',
    color: '#666',
  },

  header: {
    paddingVertical: 6,
    paddingHorizontal: 10,

    backgroundColor: '#eee',
  },

  header__name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
