import React from 'react';
import { Image, StyleSheet, Text, View, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

export class AnimatedValue extends React.PureComponent {
  modal = React.createRef();
  animated = new Animated.Value(0);

  get contentHeader() {
    return {
      padding: this.animated.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50],
      }),
    };
  }

  get contentSquare() {
    return {
      transform: [
        {
          scale: this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1.25],
          }),
        },
        {
          translateX: this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 115],
          }),
        },
        {
          translateY: this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 40],
          }),
        },
      ],
    };
  }

  get contentHeading() {
    return {
      opacity: this.animated.interpolate({
        inputRange: [0, 0.35],
        outputRange: [1, 0],
      }),
    };
  }

  get contentInner() {
    return {
      transform: [
        {
          translateY: this.animated.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 80],
          }),
        },
      ],
    };
  }

  renderContent = () => (
    <>
      <View style={s.content__header}>
        <Animated.View style={[s.content__cover, this.contentSquare]}>
          <Image style={{ width: '100%', height: '100%' }} source={{ uri: faker.image.avatar() }} />
        </Animated.View>

        <Animated.Text style={[s.content__heading, this.contentHeading]}>
          More about me
        </Animated.Text>
      </View>

      <Animated.View style={[s.content__inner, this.contentInner]}>
        <Text style={s.content__heading}>Hey that's about me!</Text>
        <Text style={s.content__subheading}>
          You wanted to know what I was playing when I was young? Well I don't remember.
        </Text>
        <Text style={s.content__paragraph}>{faker.lorem.paragraphs(3)}</Text>
      </Animated.View>
    </>
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
        panGestureAnimatedValue={this.animated}
        snapPoint={120}
        handlePosition="inside"
      >
        {this.renderContent()}
      </Modalize>
    );
  }
}

const s = StyleSheet.create({
  content__header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  content__cover: {
    width: 120,
    height: 120,

    overflow: 'hidden',

    borderRadius: 120,
    backgroundColor: '#f2f2f2',
  },

  content__image: {
    width: 120,
    height: 120,
  },

  content__inner: {
    padding: 20,
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
