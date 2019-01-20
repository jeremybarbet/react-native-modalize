import * as React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

interface IData {
  name: string;
  email: string;
}

interface IProps {
  onClosed?: () => void;
}

export default class FlatList extends React.PureComponent<IProps> {

  private modal: React.RefObject<Modalize> = React.createRef();

  get data(): IData[] {
    return Array(50).fill(0).map(_ => ({
      name: faker.name.findName(),
      email: faker.internet.email(),
    }));
  }

  private renderItem = ({ item }: { item: IData }) => (
    <View style={s.item}>
      <Text style={s.item__name}>{item.name}</Text>
      <Text style={s.item__email}>{item.email}</Text>
    </View>
  )

  private onClosed = () => {
    const { onClosed } = this.props;

    if (onClosed) {
      onClosed();
    }
  }

  public openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  render() {
    return (
      <Modalize
        ref={this.modal}
        onClosed={this.onClosed}
        flatListProps={{
          data: this.data,
          renderItem: this.renderItem,
          keyExtractor: item => item.email,
          showsVerticalScrollIndicator: false,
        }}
      />
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
