import * as React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageStyle } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

import { isIphoneX } from '../is-iphone-x';

export default class FixedContent extends React.PureComponent {

  private modal: React.RefObject<Modalize> = React.createRef();

  private renderContent = () => {
    const contentStyles = [s.content];

    if (isIphoneX()) {
      contentStyles.push(s.contentIphoneX);
    }

    return (
      <View style={contentStyles}>
        <Image
          style={s.content__icon as ImageStyle}
          source={require('../assets/send-message.png')}
        />

        <Text style={s.content__subheading}>{'Last step'.toUpperCase()}</Text>
        <Text style={s.content__heading}>Send the message?</Text>
        <Text style={s.content__description}>{faker.lorem.paragraph()}</Text>

        <TouchableOpacity
          style={s.content__button}
          activeOpacity={0.9}
          onPress={this.closeModal}
        >
          <Text style={s.content__buttonText}>{'Send'.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        adjustToContentHeight
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

  contentIphoneX: {
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 20,
  },

  content__icon: {
    width: 32,
    height: 32,

    marginBottom: 20,
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
    paddingBottom: 20,

    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },

  content__button: {
    paddingVertical: 15,

    width: '100%',

    backgroundColor: '#333',
    borderRadius: 6,
  },

  content__buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
