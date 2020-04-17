# Usage

Find more on how to use Modalize in multiple use cases.

#### Add Modalize in your component and use the `open()` method to open it

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => {
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

****

#### Example with a FlatList

If you want to use anothe renderer than the default ScrollView, you have to pass an object props for either the [FlatList](http://localhost:3000/#/PROPS?id=flatlistprops) or the [SectionList](http://localhost:3000/#/PROPS?id=sectionlistprops).

```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => {
  const modalRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalRef.current?.open();
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
        ref={modalRef}
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

#### Other children types

You also have the possibility to pass custom react-native library as a children, e.g. `react-native-webview`.

```tsx
import React, { useCallback, useMemo, useRef, MutableRefObject } from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';
import { Modalize } from 'react-native-modalize';
import WebView, { WebViewProps } from 'react-native-webview';

function useCombinedRefs<T>(...refs: Array<React.Ref<T>>): React.Ref<T> {
  return useCallback(
    (element: T) =>
      refs.forEach(ref => {
        if (!ref) {
          return;
        }

        if (typeof ref === 'function') {
          return ref(element);
        }

        (ref as MutableRefObject<T>).current = element;
      }),
    refs,
  );
}

const { height } = Dimensions.get('window');

const STATUS_BAR_HEIGHT = Platform.select({
  ios: isIphoneX ? 44 : 20,
  android: StatusBar.currentHeight,
})!;

const NAVIGATION_BAR_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
})!;

export const ModalizeWebView = React.forwardRef(({ webViewProps, ...modalizeProps }: ModalizeWebViewProps, ref: React.Ref<Modalize>) => {
  const innerRef = useRef<Modalize>(null);
  const modalizeRef = useCombinedRefs(ref, innerRef);
  const webViewRef = useRef<WebView>(null);

  const contentExpandedHeight = useMemo(
    () =>
      height -
      STATUS_BAR_HEIGHT -
      (modalizeProps.handlePosition === 'outside' ? 35 : 0),
    [modalizeProps.handlePosition],
  );
  const contentCollapsedHeight = useMemo(() => contentExpandedHeight - NAVIGATION_BAR_HEIGHT, [
    contentExpandedHeight,
  ]);

  return (
    <Modalize
      ref={modalizeRef}
      snapPoint={contentCollapsedHeight}
      {...modalizeProps}
    >
      <WebView
        ref={webViewRef}
        {...webViewProps}
        style={[webViewProps.style, { height }]}
      />
    </Modalize>
  );
});
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
  const modalRef = useRef<Modalize>(null);

  const onOpen = () => {
    modalRef.current?.open();
  };

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Text>Open the modal</Text>
      </TouchableOpacity>

      <Portal>
        <Modalize ref={modalRef}>
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
