import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modalize from 'react-native-modalize';
import { observer, inject } from 'mobx-react/native';

@inject('modalStore')
@observer
export class Modal extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // We open the modal as soon as the modal screen is mounted
    this.props.modalStore.open();
  }

  render(){
    return (
      <Modalize
        { ...this.props.modalStore.settings }
        ref={ ref => this.props.modalStore.modal = ref }
        children={this.props.modalStore.Component}
        onClosed={this.props.modalStore.destroyModal}
      />
    )
  }
}
