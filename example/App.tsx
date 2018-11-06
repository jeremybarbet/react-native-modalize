import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import Modalize from 'react-native-modalize';

export default class App extends React.Component {

  modalize: React.RefObject<Modalize> = React.createRef();

  openModal = () => {
    if (this.modalize.current) {
      this.modalize.current.open();
    }
  }

  closeModal = () => {
    if (this.modalize.current) {
      this.modalize.current.close();
    }
  }

  renderHeader() {
    return (
      <View style={{ height: 30, backgroundColor: 'red', width: '100%' }} />
    );
  }

  renderFooter() {
    return (
      <View style={{ height: 50, backgroundColor: 'red', width: '100%', borderBottomColor: 'green', borderBottomWidth: 2 }} />
    );
  }

  renderList() {
    const list = [];

    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < 50; i++) {
      list.push(<Text style={s.text} key={i}>Elem {i}</Text>);
    }

    return list;
  }

  render() {
    return (
      <View style={s.host}>
        <TouchableOpacity onPress={this.openModal}>
          <Text>Open Modalize</Text>
        </TouchableOpacity>

        <Modalize
          ref={this.modalize}
          // HeaderComponent={this.renderHeader}
          // FooterComponent={this.renderFooter}
          // height={300}
          // adjustToContentHeight
        >
          <View style={{ padding: 10 }}>
            <TouchableOpacity onPress={this.closeModal}>
              <Text>Close me</Text>
            </TouchableOpacity>

            {this.renderList()}

            <TextInput value="Input" />
          </View>
        </Modalize>
      </View>
    );
  }
}

const s = StyleSheet.create({
  host: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    padding: 16,
  },

  content: {
    marginBottom: 16,
  },

  text: {
    fontSize: 28,
    fontWeight: '200',
  },
});
