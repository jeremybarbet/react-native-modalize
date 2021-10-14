# Available hooks

There is a hook available to quickly access Modalize.

```tsx
import React, { useRef } from 'react';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const { ref, open, close } = useModalize();

  // e.g. open();

  return <Modalize ref={ref}>...your content</Modalize>;
};
```
