## Available methods

All these methods are accessible after adding a reference to Modalize.

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize ref={modalizeRef}>
        ...your content
      </Modalize>
    </>
  );
}
```

### `open()`

The method to open Modalize.

?> If you are using `snapPoint` prop, you can supply a `dest` argument to the `open` method, to open it to the top directly `open('top')`. You don't have to provide anything if you want the default behavior.

| Type                                  | Required  |
| ------------------------------------- | --------- |
| function: (dest?: 'default' \| 'top') | Yes       |

### `close()`

The method to close Modalize. You don't need to call it to dismiss the modal, since you can swipe down to dismiss.

?> If you are using `alwaysOpen` prop, you can supply a `dest` argument to the `close` method to reset it to the intial position `close('alwaysOpen')`, and avoiding to close it completely.

| Type                                         | Required |
| -------------------------------------------- | -------- |
| function: (dest?: 'default' \| 'alwaysOpen') | No       |

### `scrollTo()`

The method is used to programmatically scroll the modal content.

| Type                                                  | Required |
| ----------------------------------------------------- | -------- |
| function: (options: { y: number, animated: boolean }) | No       |

### `scrollToIndex()`

The method is used to programmatically scroll to the index of the FlatList.

!> This method only works along with `flatListProps`.

| Type                                                                                                | Required |
| --------------------------------------------------------------------------------------------------- | -------- |
| function: (options: { index: number, viewOffset: number, viewPosition: number, animated: boolean }) | No       |
