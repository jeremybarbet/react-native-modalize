import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { observer, inject } from 'mobx-react/native';

@inject('modalStore')
export class Alerts extends Component {

  constructor(props) {
    super(props);
  }


  render(){
    return (
      <SafeAreaView style={styles.container}>
        <Button title="Close modal" onPress={this.props.modalStore.close} />
        <Text>Alerts</Text>
      </SafeAreaView>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
