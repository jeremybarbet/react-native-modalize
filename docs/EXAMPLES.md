# Examples

With the following examples you will be able to see Modalize running on three popular navigators for react-native, using their built-ins way to show overlay.

#### React Native Navigation

Instead of using react-native's modal to display Modalize on top of your content all the time, `react-native-navigation` have its own way to do it, which is called `showOverlay`.

The specific call for the `showOverlay` function is located [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-native-navigation/src/screens/App.js#L22-L27).

To run this example:

```bash
cd examples/react-native-navigation
yarn
yarn start
```

```bash
cd examples/react-native-navigation
yarn ios # or android
cd ../..
yarn watch:react-native-navigation
```

****

#### React Navigation

This example uses react-navigation with a bottom tabs navigation. To be able to render Modalize on top of all the rest (and especially the bottom tabs) you will need to install the package [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize).

You can find out where is it defined in the [index.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/index.js#L8-L12) and [Examples.js](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/react-navigation/src/screens/Examples.js#L39-L49).

To run this example:

```bash
cd examples/react-navigation
yarn
npx pod-install ios
yarn start
```

```bash
cd examples/react-navigation
yarn ios # or android
cd ../..
yarn watch:react-navigation
```

****

#### Expo

This example is running under Expo without any navigator.

?> An Expo app is avalaible at the [following link](https://exp.host/@jeremdsgn/react-native-modalize).

To run this example:

```bash
cd examples/expo
yarn
yarn start
```

```bash
yarn watch:expo
```
