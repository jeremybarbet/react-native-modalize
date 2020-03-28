import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

export class MenuOverlay extends React.PureComponent {
  modal = React.createRef();

  componentDidMount() {
    this.openModal();
  }

  onClosed = () => {
    Navigation.dismissOverlay(this.props.componentId);
  };

  openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };

  renderOverlay = () => (
    <View style={s.overlay__menu}>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <TouchableOpacity
            onPress={i % 2 === 0 ? this.randomScroll : this.scrollToTop}
            style={s.touchable}
            key={i}
          >
            <Text style={s.text}>{`${i % 2 === 0 ? 'Top' : 'Bottom'}`}</Text>
          </TouchableOpacity>
        ))}
    </View>
  );

  renderContent = () => (
    <View style={s.content}>
      {Array(100)
        .fill(0)
        .map((_, i) => (
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
    </View>
  );

  scrollToTop = () => {
    if (this.modal.current) {
      this.modal.current.open('initial');
      setTimeout(() => {
        this.modal.current.scrollTo({
          y: 0,
          animated: true,
        });
      }, 300);
    }
  };

  randomScroll = () => {
    if (this.modal.current) {
      this.modal.current.open('top');
      setTimeout(() => {
        this.modal.current.scrollTo({
          y: Math.random() * 1000,
          animated: true,
        });
      }, 300);
    }
  };

  render() {
    return (
      <Modalize
        ref={this.modal}
        menuOverlay={this.renderOverlay}
        snapPoint={500}
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

  text: {
    color: '#fff',
    fontSize: 16,
  },

  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  // make sure to add zIndex higher than Modalize to your menuOverlay component
  overlay__menu: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: 'rgba(66, 0, 128,1)',
  },
});
