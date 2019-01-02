# Examples

With these three following examples you will see:

- How to use the modal using different navigators
- How to avoid using the Modal from React Native
- The best practices to display the modal

React Native team will soon remove from the core a lot of components, including the `Modal`. This is why it's not recommended to use the [withReactModal](/PROPSMETHODS?id=withreactmodal) props.

This is why most of the major navigators implemented theirs owns ways to handle the modal/overlay behavior. Both `react-native-navigation` and `react-navigation` examples are made using a bottom tab bar because it's a very common design pattern and show you how to use `Modalize` without using `withReactModal` props.

See below for an explanation for each of the navigators.

?> All the modals, layout, text and buttons are shared between the different examples to make it easier to maintain. You can find the code in `examples/shared`. For the moment, the shared folder is used with a npm path `"shared": "file:../shared"`. There isn't any live-reload solution yet, so you will have to remove the `node_modules` from the example folder after you finished to change the `shared` folder.

## React Native Navigation

This is probably the simplest navigator to handle this bevahior. There is a method called `showOverlay` that will open the Modalize screen on top of the current screen.

You can run this example by doing:

```bash
cd react-native-modalize
yarn start react-native-navigation
# Another tab
cd examples/react-native-navigation
react-native run-ios
# Another tab
yarn watch:react-native-navigation
```

## React Navigation

This example use react-navigation and run under Expo. Modalize is wrapped along the AppNavigator to be able to display the modal on top of the bottom navigator.

> An Expo app is avalaible at the [following link](https://expo.io/@jeremdsgn/modalize-react-navigation).

You can run this example by doing:

```bash
cd react-native-modalize
yarn start react-navigation
# Another tab
yarn watch:react-navigation
```

## Expo

This example is runing under Expo without any navigator. Also, in this example `withReactModal` is `false`, which mean the Modal might be displayed under another component depending where you use it.

> An Expo app is avalaible at the [following link](https://expo.io/@jeremdsgn/modalize-expo).

You can run this example by doing:

```bash
cd react-native-modalize
yarn start expo
# Another tab
yarn watch:expo
```
