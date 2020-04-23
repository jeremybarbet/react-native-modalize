import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

export const SectionList = ({ componentId }) => {
  const modalizeRef = useRef(null);

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

  const handleClosed = () => {
    Navigation.dismissOverlay(componentId);
  };

  const handleOpen = () => {
    if (modalizeRef.current) {
      modalizeRef.current.open();
    }
  };

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

  useEffect(() => {
    handleOpen();
  }, []);

  return (
    <Modalize
      ref={modalizeRef}
      onClosed={handleClosed}
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
};

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
