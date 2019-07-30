import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

export class AlwaysOpen extends React.PureComponent {

  modal = React.createRef();

  renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__subheading}>{'Introduction'.toUpperCase()}</Text>
      <Text style={s.content__heading}>Always open modal!</Text>
      <Text style={s.content__description}>{faker.lorem.paragraph()}</Text>
    </View>
  )

  render() {
    return (
      <Modalize
        ref={this.modal}
        modalStyle={s.content__modal}
        alwaysOpen={85}
        handlePosition="inside"
      >
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  content: {
    padding: 20,
  },

  content__modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
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
    paddingBottom: 10,

    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },
});
