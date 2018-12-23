import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { observer, inject } from 'mobx-react/native';

import { Filter, Alerts } from 'screens';

@inject('modalStore')
@observer
export class List extends Component {

  constructor(props) {
    super(props);
  }

  openModal = () => {
    this.props.modalStore.Component = <Filter/>;
    this.props.modalStore.settings = {
      adjustToContentHeight: true
    };
    this.props.modalStore.isVisible = true;
  }
  openModal1 = () => {
    this.props.modalStore.Component = <Alerts/>;
      this.props.modalStore.settings = {
        height: 600
      };
    this.props.modalStore.isVisible = true;
  }

  _goToDetail = () => {
    this.props.navigation.navigate('detail');
  };




  render(){
    return (
      <View style={styles.container}>
        <Button title={'Filtre 1'} onPress={this.openModal1} small/>
        <Button title={'Filtre 2'} onPress={this.openModal} small/>
        <Button title='Detail Page' onPress={this._goToDetail} small/>
      </View>
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
