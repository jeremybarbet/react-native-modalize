# Modalize

[![npm version](https://badge.fury.io/js/react-native-modalize.svg)](https://badge.fury.io/js/react-native-modalize)

> 🚨 **Warning** If you are using `expo`, the latest version makes the scroll/swipe behavior not usable. You need to use `"expo": "31.0.0"` and `"react-native": "https://github.com/expo/react-native/archive/sdk-31.0.0.tar.gz"` to make it works properly. I will dig in to see what's the issue.

<hr>

A modal that loves scrollable content.

This component has been built with `react-native-gesture-handler` to address the common issue of **scrolling**, **swipping** and handling the **keyboard** behaviors, you can face with react-native's modal.

This component comes with a ScrollView, the default content renderer, a FlatList and a SectionList. They are all three built-in and make your life easier, just pass your content and Modalize will handle the rest for you.

<p align="left">
  <img src="https://user-images.githubusercontent.com/937328/48359862-ca19bc80-e695-11e8-9e66-6ed182f3dd87.gif" height="532" />
  <img src="https://user-images.githubusercontent.com/937328/48358611-07307f80-e693-11e8-852d-a14200005b30.gif" height="532" />
  <img src="https://user-images.githubusercontent.com/937328/48358629-0dbef700-e693-11e8-8281-f86e280db7ac.gif" height="531" />
</p>

## Installation

```bash
yarn add react-native-modalize
```

Check out [`react-native-gesture-handler`'s documentation](https://kmagiera.github.io/react-native-gesture-handler/docs/getting-started.html) to set it up.

## Usage

Here is the quick how-to example:

```jsx
import React, { PureComponent, createRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modalize from 'react-native-modalize';

export default class MyApp extends PureComponent {

  modal = createRef();

  onOpen = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  render () {
    return (
      <View>
        <TouchableOpacity onPress={this.onOpen}>
          <Text>Open the modal</Text>
        </TouchableOpacity>

        <Modalize ref={this.modal}>
          ...your content
        </Modalize>
      </View>
    );
  }
}
```

## Documentation

The full [documentation is available here](https://jeremybarbet.github.io/react-native-modalize). There is multiple examples runing through differents navigators, with more informations [here](https://jeremybarbet.github.io/react-native-modalize/#/EXAMPLES.md).
