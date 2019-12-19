# Usage

**1. Import Modalize**

```jsx
import { Modalize } from 'react-native-modalize';
```

**2. Add the modal in your render function, and use the `open` method to open the modal**

```jsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

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

?> This is a really straight-forward example. If you want to see more complex examples on how to implement it along a navigator, check the [examples' documentation](/EXAMPLES.md).
