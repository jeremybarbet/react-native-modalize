import React from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput, ScrollView } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

const { width } = Dimensions.get('window');

export class SimpleContent extends React.PureComponent {
  modal = React.createRef();

  openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };

  renderContent = () => [
    <View style={s.content__header} key="0">
      <Text style={s.content__heading}>Article title</Text>
      <Text style={s.content__subheading}>November 11st 2018</Text>
    </View>,

    <View style={s.content__inside} key="1">
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(3)}</Text>
      <Text style={[s.content__subheading, { marginTop: 30 }]}>Horizontal ScrollView</Text>

      <ScrollView style={s.content__scrollview} horizontal>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={s.content__block} />
          ))}
      </ScrollView>

      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(2)}</Text>
      <Text style={[s.content__subheading, { marginTop: 30 }]}>Vertical ScrollView</Text>

      <ScrollView style={[s.content__scrollview, { height: 200 }]}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={[s.content__block, { width, marginBottom: 20 }]} />
          ))}
      </ScrollView>

      <TextInput
        style={s.content__input}
        placeholder="Type your username"
        clearButtonMode="while-editing"
      />
    </View>,
  ];

  render() {
    return (
      <Modalize
        ref={this.modal}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          stickyHeaderIndices: [0],
        }}
      >
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  content__header: {
    padding: 15,
    paddingBottom: 0,

    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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

  content__inside: {
    padding: 15,
  },

  content__paragraph: {
    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },

  content__scrollview: {
    marginVertical: 20,
  },

  content__block: {
    width: 200,
    height: 80,

    marginRight: 20,

    backgroundColor: '#ccc',
  },

  content__input: {
    paddingVertical: 15,
    marginBottom: 10,

    width: '100%',

    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: '#cdcdcd',
    borderRadius: 6,
  },
});
