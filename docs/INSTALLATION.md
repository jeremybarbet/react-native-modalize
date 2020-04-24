# Installation

1. Install `react-native-modalize`

```bash
yarn add react-native-modalize
```

2. Modalize also needs `react-native-gesture-handler`

```bash
yarn add react-native-gesture-handler
npx pod-install ios
```

---

- Expo

If you use Expo you are good to go!

- React Native Navigation

To complete the Android setup part, you will need to wrap your screens with `react-native-gesture-handler`'s HandlerWrapper. This is located where you defined your screens, e.g. `index.js`.

```tsx
import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

Navigation.registerComponent('com.myApp.WelcomeScreen', () => gestureHandlerRootHOC(App));
```

- React Navigation

To complete the Android setup part, you will need to change your `MainActivity.java` file to enable `react-native-gesture-handler` instance.

```diff
package com.example;

import com.facebook.react.ReactActivity;

+ import com.facebook.react.ReactActivityDelegate;
+ import com.facebook.react.ReactRootView;
+ import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Example";
  }

+  @Override
+  protected ReactActivityDelegate createReactActivityDelegate() {
+    return new ReactActivityDelegate(this, getMainComponentName()) {
+      @Override
+      protected ReactRootView createRootView() {
+       return new RNGestureHandlerEnabledRootView(MainActivity.this);
+      }
+    };
+  }
}
```

You can find the whole documentation about react-native-gesture-handler [here](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html).
