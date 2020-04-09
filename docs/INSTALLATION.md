# Installation

1. Install `react-native-modalize`

```bash
yarn add react-native-modalize
```

?> If you are using Modalize `< 1.3.7-rc.18` and not running on Expo, you will need to follow [react-native-gesture-handler's setup guide](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html).

2. Add Modalize in your component and use the `open` method to open it

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

      <Modalize ref={modalRef}>
        ...your content
      </Modalize>
    </>
  );
}
```

?> This is a really straight-forward example. If you want to see more complex examples on how to implement it along different navigators and props, check the [examples' documentation](/EXAMPLES.md).
