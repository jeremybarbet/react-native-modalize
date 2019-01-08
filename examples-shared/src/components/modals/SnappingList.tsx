import * as React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Modalize from 'react-native-modalize';
import faker from 'faker';
import { Button } from 'react-native-modalize/shared';

interface IProps {
  onClosed?: () => void;
}

export default class SnappingList extends React.PureComponent<IProps> {

  private modal: React.RefObject<Modalize> = React.createRef();

  private renderHeader = () => (
    <View style={s.modal__header}>
      <Text style={s.modal__headerText}>50 users online</Text>
    </View>
  )

  private renderContent = () => (
    <View style={s.content}>
      {[...Array(50).keys()].map((_, i) => (
        <View style={s.content__row} key={i}>
          <View style={s.content__avatar}>
            <Image
              style={{ width: '100%', height: '100%' }}
              source={{ uri: faker.image.avatar() }}
            />
          </View>

          <Text style={s.content__name}>{faker.name.findName()}</Text>
        </View>
      ))}
      <View style={s.content__buttonContainer}>
        <Button onPress={this.scrollToTop} name="Scroll to Top" />
      </View>
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

  private scrollToTop = () => {
    if (this.modal.current) {
      this.modal.current.scrollTo({
        y: 0,
        animated: true,
      });
    }
  }

  render() {
    return (
      <Modalize
        ref={this.modal}
        HeaderComponent={this.renderHeader}
        height={350}
        onClosed={this.onClosed}
      >
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  modal__header: {
    paddingVertical: 15,
    marginHorizontal: 15,

    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },

  modal__headerText: {
    fontSize: 15,
    fontWeight: '200',
  },

  content: {
    paddingHorizontal: 15,
  },

  content__buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  content__row: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 15,

    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
  },

  content__avatar: {
    width: 38,
    height: 38,

    marginRight: 15,

    overflow: 'hidden',

    backgroundColor: '#eee',
    borderRadius: 19,
  },

  content__name: {
    fontSize: 16,
  },
});
