import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

export default class AbsoluteHeader extends React.PureComponent {

  private modal: React.RefObject<Modalize> = React.createRef();

  private renderHeader = () => (
    <TouchableOpacity
      style={s.modal__cross}
      activeOpacity={0.8}
      onPress={this.closeModal}
    >
      <Image source={require('../assets/cross.png')} />
    </TouchableOpacity>
  )

  private renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__heading}>Article title</Text>
      <Text style={s.content__subheading}>November 11st 2018</Text>
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(8)}</Text>
    </View>
  )

  public openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  public closeModal = () => {
    if (this.modal.current) {
      this.modal.current.close();
    }
  }

  render() {
    return (
      <Modalize
        ref={this.modal}
        HeaderComponent={this.renderHeader}
        withHandle={false}
      >
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  modal__cross: {
    position: 'absolute',
    top: 20,
    right: 20,

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
