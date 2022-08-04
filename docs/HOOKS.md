# Available hooks

There is a hook available to quickly access Modalize. It returns an object with
three keys:

- `ref`: a ref object to pass to the `Modalize` component
- `open`: a function that opens the `Modalize` component. If you are using
  `snapPoint` prop, you can supply a `dest` argument to the `open`
  function, to open it to the top directly `open('top')`. You don't have
  to provide anything if you want the default behavior.
- `close`: a function that closes the `Modalize` component. You don't need to call
  it to dismiss the modal, since you can swipe down to dismiss.
  If you are using `alwaysOpen` prop, you can supply a `dest` argument
  to the `close` function to reset it to the initial position
  `close('alwaysOpen')`, and avoiding to close it completely.

```tsx
import React from 'react';
import { Modalize, useModalize } from 'react-native-modalize';

export const App = () => {
  const { ref, open, close } = useModalize();

  // e.g. open();

  return <Modalize ref={ref}>...your content</Modalize>;
};
```
