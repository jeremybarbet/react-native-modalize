# Usage

For the basic usage, add Modalize in your component and use the `open()` method to open it.

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const modalizeRef = useRef<Modalize | null>(null);

  return (
    <>
      <TouchableOpacity onPress={modalizeRef.current?.open()}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize ref={modalizeRef}>...your content</Modalize>
    </>
  );
};
```
