# Examples

All the examples are running under 3 different navigators. Check out the [development section](/DEVELOPMENT.md) to find out how to run these examples.

<div class="grid" style="display: flex; justify-content: space-between; flex-direction: column; margin: 20px 0 30px;">
  <div class="item" style="
    width: 100%;
    margin-bottom: 20px;
    background-color: rgb(246, 251, 254);
    border-radius: 6px;
    border: 1px solid rgb(80, 188, 239);
    padding: 20px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 6px;
    ">
    <h5 style="margin-top: -5px; margin-bottom: 10px;">React Native Navigation</h5>
    <p style="font-size: 16px">We are using <strong>showOverlay</strong> from <strong>react-native-navigation</strong> to show Modalize.</p>
    <p style="font-size: 16px; margin-bottom: 0;">The function is called <a href="https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-native-navigation/src/screens/App.js#L22-L27">here</a>.</p>
  </div>

  <div class="item" style="
    width: 100%;
    margin-bottom: 20px;
    background-color: rgb(246, 251, 254);
    border-radius: 6px;
    border: 1px solid rgb(80, 188, 239);
    padding: 20px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 6px;
    ">
    <h5 style="margin-top: -5px; margin-bottom: 10px;">React Navigation</h5>
    <p style="font-size: 16px">This example uses <strong>bottom tabs</strong> and we need <a href="https://github.com/jeremybarbet/react-native-portalize">react-native-portalize</a> to show Modalize on top of the rest.</p>
    <p style="font-size: 16px; margin-bottom: 0;">Used in <a href="https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/index.js#L8-L12">index.js</a> and <a href="https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/screens/Examples.js#L39-L49">Examples.js</a>.</p>
  </div>

  <div class="item" style="
    width: 100%;
    background-color: rgb(246, 251, 254);
    border-radius: 6px;
    border: 1px solid rgb(80, 188, 239);
    padding: 20px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 6px;
    ">
    <h5 style="margin-top: -5px; margin-bottom: 10px;">Expo</h5>
    <p style="font-size: 16px">This example is running under Expo without any navigator.</p>
    <p style="font-size: 16px; margin-bottom: 0;">An Expo app is available at the <a href="https://exp.host/@jeremdsgn/react-native-modalize">following link</a>.</p>
  </div>
</div>

?> Thanks to `react-native-web`, Expo's example in also available in the browser. Visit the [development section](DEVELOPMENT) to see how to run it.

?> All references to each file are going to the Expo folder but it's also available in the React Native Navigation and React Navigation folders and can be slightly different for the usage of each navigators.

---

#### Example with a FlatList

If you want to use another renderer than the default ScrollView, you can pass an object props for either the [FlatList](PROPS?id=flatlistprops) or the [SectionList](PROPS?id=sectionlistprops).

?> There is two complete examples called [Flat List](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/FlatList.js) and [Section List](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/SectionList.js) available in the examples.

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

---

#### Bottom tabs navigation and Modalize

If you are using a bottom tab navigation (e.g. with react-navigation) and you want to display Modalize on top of the bottom tabs, you will need to install [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize). It will allow you to wrap a component with a `Portal` and will render it on top of the rest.

?> You can also find out where is it used specifically for react-navigation in [index.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/index.js#L8-L12) and [Examples.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/screens/Examples.js#L52-L62).

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
        <Modalize ref={modalizeRef}>...your content</Modalize>
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

---

#### iOS 13 Modal Presentation Style

It's possible to replicate the new modal presentation style now shipped by default with iOS for both Android and iOS.

You will need for that to use the [`panGestureAnimatedValue`](/PROPS.md?id=panGestureAnimatedValue) and [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize) and use the Animated API to animate your app wrapper. Here is a quick implementation example.

?> If you want a more complete example, you can find [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/AnimatedValue.js) a reproduction of iOS 13 Modal Presentation Style.

```tsx
import React, { useRef } from 'react';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { Host } from 'react-native-portalize';

const App = () => {
  const modalizeRef = useRef<Modalize>(null);
  const animated = useRef(new Animated.Value(0)).current;

  const onOpen = () => {
    modalizeRef.current?.open();
  };

  return (
    <Host style={{ backgroundColor: '#000' }}>
      <View
        style={{
          flex: 1,
          borderRadius: animated.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
          transform: [
            {
              scale: animated.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }),
            },
          ],
          opacity: animated.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }),
        }}
      >
        <TouchableOpacity onPress={onOpen}>
          <Text>Open the modal</Text>
        </TouchableOpacity>

        <Portal>
          <Modalize ref={modalizeRef} panGestureAnimatedValue={animated}>
            ...your content
          </Modalize>
        </Portal>
      </Layout>
    </Host>
  );
};
```

---

#### WebView (third-party library)

If you want to use a WebView as a Modalize's renderer, it's possible! You will need to install `react-native-webview` and follow their [guide](https://github.com/react-native-community/react-native-webview/blob/master/docs/Getting-Started.md) to set it up. Once it's done you can do something like this to have a basic WebView.

?> If you want a more complete example, you can find [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/FacebookWebView.js) a reproduction of the Facebook WebView.

```tsx
import React, { useRef } from 'react';
import { Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import WebView from 'react-native-webview';

const { height: initialHeight } = Dimensions.get('window');

export const ModalizeWebView = () => {
  const modalizeRef = useRef<Modalize>(null);
  const webViewRef = useRef<WebView>(null);
  const [height, setHeight] = useState(initialHeight);

  const handleLayout = ({ layout }) => {
    setHeight(layout.height);
  };

  return (
    <Modalize ref={modalizeRef} onLayout={handleLayout}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://github.com/jeremybarbet/react-native-modalize' }}
        style={{ height }}
      />
    </Modalize>
  );
};
```

---

#### TabView (third-party library)

If you want to have multiple tabs inside Modalize you can install `react-native-tab-view`. Follow the [installation](https://github.com/react-native-community/react-native-tab-view#installation) step to set it up.

You can then do something simple like below.

?> A more complete example is available [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/SlackTabView.js) with a reproduction of the Slack Emoji TabView.

```tsx
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { TabView, SceneMap } from 'react-native-tab-view';

const { width } = Dimensions.get('window');
const Route = () => <View style={[{ flex: 1, backgroundColor: '#439bdf' }]} />;

const Tabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  const renderScene = SceneMap({
    first: Route,
    second: Route,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width }}
    />
  );
};

export const ModalizeTabView = () => {
  const modalizeRef = useRef<Modalize>(null);

  return (
    <Modalize ref={modalizeRef}>
      <Tabs />
    </Modalize>
  );
};
```
