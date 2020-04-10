# Modalize

[![npm version](https://badge.fury.io/js/react-native-modalize.svg)](https://badge.fury.io/js/react-native-modalize)

A modal that loves scrollable content.

This component has been built with `react-native-gesture-handler` to address the common issue of **scrolling**, **swipping** and handling the **keyboard** behaviors, you can face with react-native's modal.

This component comes with a ScrollView, the default content renderer, a FlatList and a SectionList. They are all three built-in and make your life easier, just pass your content and Modalize will handle the rest for you.

<p align="left">
  <img src="https://user-images.githubusercontent.com/937328/59955680-22f6d200-947b-11e9-8744-991a728596df.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955681-22f6d200-947b-11e9-9288-9142e98ffae8.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955682-22f6d200-947b-11e9-8ed5-6a29042e72f1.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955683-22f6d200-947b-11e9-89e8-3608eea34e8d.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955684-22f6d200-947b-11e9-97d2-0687a29921db.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955685-238f6880-947b-11e9-81f9-6345fba118f5.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955686-238f6880-947b-11e9-896a-bcdb34e827b7.gif" height="450" />
  <img src="https://user-images.githubusercontent.com/937328/59955687-238f6880-947b-11e9-9345-55ea2bc8e458.gif" height="450" />
</p>

## Installation

```bash
yarn add react-native-modalize react-native-gesture-handler
```

<details>
<summary><strong>Running Modalize `< 1.3.7-rc.18` ?</strong></summary>
<p>

You will need to complete the setup from `react-native-gesture-handler` available [here](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html). It's automatically embed within Modalize in the latest versions.

</p>
</details>

## Usage

Here is the quick how-to example:

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const MyApp = () => {
  const modalRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalRef.current?.open();
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize ref={modalRef}>...your content</Modalize>
    </>
  );
};
```

## Documentation

The full [documentation is available here](https://jeremybarbet.github.io/react-native-modalize). There is multiple examples runing through differents navigators, with more informations [here](https://jeremybarbet.github.io/react-native-modalize/#/EXAMPLES.md).
