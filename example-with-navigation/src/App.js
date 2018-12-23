import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, StatusBar } from 'react-native';
import { Provider } from 'mobx-react';
import { observer, Observer } from 'mobx-react/native';

import { Modal } from 'components';
import { RootStore } from 'stores';
import { AppContainer } from 'router';
const stores = new RootStore();

@observer
export class App extends React.Component {

  constructor(props){
    super(props);
  }

  render() {
    return (
      <Provider {...stores}>
        <View style={styles.navigator}>
          <StatusBar barStyle='light-content' />
          <AppContainer
            containerStyle={styles.navigator}
          />
        { stores.modalStore.isVisible && <Modal/>}
        </View>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  navigator: {
    flex:1
  }
});
