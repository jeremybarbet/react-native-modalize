import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

interface IProps {
  onClosed?: () => void;
}

export default class InputForm extends React.PureComponent<IProps> {

  private modal: React.RefObject<Modalize> = React.createRef();

  private renderContent = () => {
    return (
      <View style={s.content}>
        <Text style={s.content__subheading}>{'Last step'.toUpperCase()}</Text>
        <Text style={s.content__heading}>Send the message?</Text>
        <Text style={s.content__description}>{faker.lorem.lines(1)}</Text>
        <TextInput style={s.content__input} placeholder="Type your username" />
      </View>
    );
  }

  private renderFooter = () => (
    <TouchableOpacity
      style={s.modal__footer}
      activeOpacity={0.8}
      onPress={this.closeModal}
    >
      <Text style={s.modal__footerText}>{'Submit'.toUpperCase()}</Text>
    </TouchableOpacity>
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

  public closeModal = () => {
    if (this.modal.current) {
      this.modal.current.close();
    }
  }

  render() {
    return (
      <Modalize
        ref={this.modal}
        footer={{
          component: this.renderFooter,
          isAbsolute: false,
        }}
        onClosed={this.onClosed}
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
    paddingBottom: 5,

    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
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

  modal__footer: {
    backgroundColor: '#333',
  },

  modal__footerText: {
    paddingVertical: 25,

    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
