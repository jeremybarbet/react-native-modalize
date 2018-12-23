import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { observer, inject } from 'mobx-react/native';

export class SignIn extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>SIGNIN</Text>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
