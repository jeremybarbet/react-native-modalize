# Available methods

These two methods are accessible after adding a reference to Modalize and are used to control its visibility.

```tsx
import React, { useRef } from 'react';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const modalizeRef = useRef<Modalize>(null);

  // e.g. modalizeRef.current?.open();

  return <Modalize ref={modalizeRef}>...your content</Modalize>;
};
```

---

## Core

### `open()`

The method to open Modalize.

?> If you are using `snapPoint` prop, you can supply a `dest` argument to the `open` method, to open it to the top directly `open('top')`. You don't have to provide anything if you want the default behavior.

| Type                                  | Required |
| ------------------------------------- | -------- |
| function: (dest?: 'default' \| 'top') | Yes      |

### `close()`

The method to close Modalize. You don't need to call it to dismiss the modal, since you can swipe down to dismiss.

?> If you are using `alwaysOpen` prop, you can supply a `dest` argument to the `close` method to reset it to the initial position `close('alwaysOpen')`, and avoiding to close it completely.

| Type                                         | Required |
| -------------------------------------------- | -------- |
| function: (dest?: 'default' \| 'alwaysOpen') | No       |

## Externals

If you want to use `scrollTo()` from the ScrollView, or `scrollToIndex()` from the FlatList (when using `flatListProps`), you will need to add a `contentRef`.

Visit this [section](/PROPS.md?id=contentRef) to find more information about this usage.
