# Usage

**1. Import Modalize**

```jsx
import Modalize from 'react-native-modalize';
```

**2. Add the modal in your render function, and use the `open` method to open the modal**

```jsx
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modalize from 'react-native-modalize';

export default class MyApp extends React.PureComponent {

  modal = React.createRef();

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

?> This is a really straight-forward example. If you want to see more complex examples on how to implement it along a navigator, check the [examples' documentation](/EXAMPLES.md).
