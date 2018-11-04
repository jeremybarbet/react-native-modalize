import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import Modalize from '../lib';

export default class App extends React.Component {

  modalize = React.createRef();

  static get options() {
    return {
      topBar: {
        visible: false,
      },
    };
  }

  componentDidAppear() {
    Store.UI.setComponentId(this.props.componentId);
  }

  openModalize = () => {
    if (this.modalize.current) {
      this.modalize.current.open();
    }
  }

  renderList() {
    const list = [];

    for (let i = 0; i < 50; i++) {
      list.push(<Text style={s.text} key={i}>Elem {i}</Text>);
    }

    return list;
  }

  render() {
    return (
      <View style={s.host}>
        <TouchableOpacity onPress={this.openModalize}>
          <Text>Open Modalize</Text>
        </TouchableOpacity>

        <Modalize
          ref={this.modalize}
          height={300}
        >
          <View style={{ paddingLeft: 10 }}>
            {this.renderList()}
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
