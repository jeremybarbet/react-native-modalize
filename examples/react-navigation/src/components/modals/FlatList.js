import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

export class FlatList extends React.PureComponent {
  modal = React.createRef();

  get data() {
    return Array(50)
      .fill(0)
      .map(_ => ({
        name: faker.name.findName(),
        email: faker.internet.email(),
      }));
  }

  openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };

  renderItem = ({ item }) => (
    <View style={s.item}>
      <Text style={s.item__name}>{item.name}</Text>
      <Text style={s.item__email}>{item.email}</Text>
    </View>
  );

  render() {
    return (
      <Modalize ref={this.modal}>
        <Animated.FlatList
          ref={this.flatList}
          data={this.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.email}
          showsVerticalScrollIndicator={false}
        />
      </Modalize>
    );
  }
}

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
});
