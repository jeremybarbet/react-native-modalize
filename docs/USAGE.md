# Usage

Find more on how to use Modalize in multiple use cases.

#### Add Modalize in your component and use the `open()` method to open it

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

****

#### Example with a FlatList

If you want to use anothe renderer than the default ScrollView, you have to pass an object props for either the [FlatList](http://localhost:3000/#/PROPS?id=flatlistprops) or the [SectionList](http://localhost:3000/#/PROPS?id=sectionlistprops).

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  const getData = () => ({ ... });

  const renderItem = (item) => (
    <View>
      <Text>{item.heading}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Modalize
        ref={modalizeRef}
        flatListProps={{
          data: getData(),
          renderItem: renderItem,
          keyExtractor: item => item.heading,
          showsVerticalScrollIndicator: false,
        }}
      />
    </>
  );
}
```

****

#### Bottom tabs navigation and Modalize

If you are using a bottom tab navigation (e.g. with react-navigation) and you want to display Modalize on top of the bottom tabs, you will need to install [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize). It will allow you to wrap a component with a `Portal` and will render it on top of the rest.

You can also find out where is it used in the react-navigation example's folder [index.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/index.js#L8-L12) and [Examples.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/screens/Examples.js#L39-L49).

```tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Modalize } from 'react-native-modalize';
import { Host, Portal } from 'react-native-portalize';

const Tab = createBottomTabNavigator();

const ExamplesScreen = () => {
  const modalizeRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize ref={modalizeRef}>
          ...your content
        </Modalize>
      </Portal>
    </>
  );
};

const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Settings screen</Text>
  </View>
);

export const App = () => (
  <NavigationContainer>
    <Host>
      <Tab.Navigator>
        <Tab.Screen name="Examples" component={ExamplesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </Host>
  </NavigationContainer>
);
```

****

#### More examples

There is more examples available in the examples [folder](https://github.com/jeremybarbet/react-native-modalize/tree/master/examples) and you can find more about them [here](/EXAMPLES.md).
