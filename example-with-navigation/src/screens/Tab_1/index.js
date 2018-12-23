import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { observer, inject } from 'mobx-react/native';

import { Filter } from 'screens';

@inject('modalStore')
export class Tab_1 extends Component {


  constructor(props) {
    super(props);
  }

  openModal = () => {
    this.props.modalStore.Component = <Filter/>;
    this.props.modalStore.isVisible = true;
  }

  render(){
    return (
      <View style={styles.container}>
        <Text>TAB 1</Text>
        <Button title='Open modal' onPress={this.openModal} small/>
      </View>
    )
  }
}
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
