import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';

export class PanListener extends React.PureComponent {
  modal = React.createRef();
  animated = new Animated.Value(0);

  get contentSquare() {
    return {
      transform: [
        {
          scale: this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
            // extrapolate: 'clamp',
          }),
        },
      ],
    };
  };

  renderContent = () => (
    <View style={s.content__header}>
      <Text style={s.content__heading}>My modal</Text>
      <Text style={s.content__subheading}>With a view animated with the modal</Text>
      <Animated.View style={[s.content__square, this.contentSquare]} />
    </View>
  );

  openModal = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  };

  render() {
    return (
      <Modalize
        ref={this.modal}
        panValue={this.animated}
        alwaysOpen={200}
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

  content__square: {
    width: 200,
    height: 200,

    backgroundColor: 'red',
  },
});
