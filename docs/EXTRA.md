# Extra third-party examples

Besides the default configuration you have to create your own modal, you have the possibility to use third-party library with Modalize. Here is a few usefull examples.

#### WebView

If you want to use a WebView as a Modalize's renderer, it's possible! You will need to install `react-native-webview` and follow their [guide](https://github.com/react-native-community/react-native-webview) to set it up. Once it's done you can do something like this to have a basic WebView.

?> If you want a more complete example, you can find [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/FacebookWebView.js) a reproduction of the Facebook WebView. It's available for all expo, react-navigation and react-native-navigation.

```tsx
import React, { useCallback, useMemo, useRef, MutableRefObject } from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';
import { Modalize } from 'react-native-modalize';
import WebView, { WebViewProps } from 'react-native-webview';

const useCombinedRefs = <T>(...refs: Array<React.Ref<T>>): React.Ref<T> => useCallback((element: T) =>
  refs.forEach(ref => {
    if (!ref) {
      return;
    }

    if (typeof ref === 'function') {
      return ref(element);
    }

    (ref as MutableRefObject<T>).current = element;
  }), refs);

const { height } = Dimensions.get('window');

export const ModalizeWebView = React.forwardRef(({ webViewProps, ...modalizeProps }: ModalizeWebViewProps, ref: React.Ref<Modalize>) => {
  const innerRef = useRef<Modalize>(null);
  const webViewRef = useRef<WebView>(null);
  const modalizeRef = useCombinedRefs(ref, innerRef);

  return (
    <Modalize ref={modalizeRef} {...modalizeProps}>
      <WebView
        ref={webViewRef}
        {...webViewProps}
        style={[webViewProps?.style, { height }]}
      />
    </Modalize>
  );
});
```

****

#### iOS 13 Modal Presentation Style

It's possible to replicate the new modal presentation style now shipped by default with iOS for both Android and iOS.

You will need for that to use the [`panGestureAnimatedValue`](/PROPS.md?id=panGestureAnimatedValue) and [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize) and use the Animated API to animate your app wrapper. Here is a quick implementation example.

?> If you want a more complete example, you can find [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/AnimatedValue.js) a reproduction of iOS 13 Modal Presentation Style. It's available for all expo, react-navigation and react-native-navigation.

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

****

#### TabView

TODO
