import * as React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

interface IData {
  product: string;
  price: string;
}

interface ISection {
  title: string;
  data: IData[];
}

interface IProps {
  onClosed?: () => void;
}

export default class FlatList extends React.PureComponent<IProps> {

  private modal: React.RefObject<Modalize> = React.createRef();

  get sections(): ISection[] {
    return [
      {
        title: 'January 2019',
        data: Array(10).fill(0).map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
      },
      {
        title: 'December 2018',
        data: Array(12).fill(0).map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
      },
      {
        title: 'November 2018',
        data: Array(4).fill(0).map(_ => ({
          product: faker.commerce.productName(),
          price: faker.commerce.price(),
        })),
      },
    ];
  }

  private renderItem = ({ item }: { item: IData }) => (
    <View style={s.item}>
      <Text style={s.item__product}>{item.product}</Text>
      <Text style={s.item__price}>{item.price}€</Text>
    </View>
  )

  private renderSectionHeader = ({ section }: any) => (
    <View style={s.header}>
      <Text style={s.header__name}>{section.title.toUpperCase()}</Text>
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
        sectionListProps={{
          sections: this.sections,
          renderItem: this.renderItem,
          renderSectionHeader: this.renderSectionHeader,
          keyExtractor: (item, index) => `${item.title}-${index}`,
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
