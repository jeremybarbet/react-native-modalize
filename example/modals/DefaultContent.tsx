import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';

export default class DefaultContent extends React.PureComponent {

  private modal: React.RefObject<Modalize> = React.createRef();

  private renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(8)}</Text>
    </View>
  )

  public openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  render() {
    return (
      <Modalize ref={this.modal}>
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',

    padding: 15,
  },

  content__paragraph: {
    fontSize: 16,
  },
});
