# Modalize

[![npm version](https://badge.fury.io/js/react-native-modalize.svg)](https://badge.fury.io/js/react-native-modalize)

A modal that loves scrollable content.

This component has been built with `react-native-gesture-handler` to address the common issue of **scrolling**, **swipping** and handling the **keyboard** behaviors, you can face with react-native's modal. This component comes with a ScrollView, the default content renderer, a FlatList and a SectionList. They are all three built-in and make your life easier, just pass your content and Modalize will handle the rest for you.

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
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modalize from 'react-native-modalize';

export const MyApp = () => {
  const modalRef = useRef<Modalize>(null);

  const onOpen = () => {
    const modal = modalRef.current;

    if (modal) {
      modal.open();
    }
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize ref={modalRef}>
        ...your content
      </Modalize>
    </>
  );
}
```

## Documentation

The full [documentation is available here](https://jeremybarbet.github.io/react-native-modalize). There is multiple examples runing through differents navigators, with more informations [here](https://jeremybarbet.github.io/react-native-modalize/#/EXAMPLES.md).
