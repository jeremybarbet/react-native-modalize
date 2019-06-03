# Examples

These three examples are made to show you:

- How to use the modal using different navigators
- How to avoid using the Modal from React Native
- The best practices to display Modalize

React Native team will soon remove from the core a lot of components, including the `Modal`. This is why it's not recommended to use [withReactModal](/PROPSMETHODS?id=withreactmodal) props.

This is why most of the major navigators implemented theirs owns ways to handle the modal/overlay behavior. `react-native-navigation` uses the `showOverlay` method and `react-navigation` is just imported on the screen you want to display the modal.

See below for an explanation of each navigators. Run first in the root folder:

```bash
cd react-native-modalize
yarn
```

## React Native Navigation

This is probably the simplest navigator to handle this bevahior. There is a method called `showOverlay` that will open the Modalize screen on top of the current screen.

You can run this example by:

```bash
cd examples/react-native-navigation
yarn
yarn start # tab 1
yarn watch:react-native-navigation # tab 2
yarn ios (or android) # tab 3
```

## React Navigation

This example use react-navigation. Modalize is used on the screen you need to toggle it.

You can run this example by:

```bash
cd examples/react-navigation
yarn
yarn start # tab 1
yarn watch:react-navigation # tab 2
yarn ios (or android) # tab 3
```

## Expo (TODO)

This example is runing under Expo without any navigator. Also, in this example `withReactModal` is `false`, which mean the Modal might be displayed under another component depending where you use it.

> An Expo app is avalaible at the [following link](https://expo.io/@jeremdsgn/modalize-expo).
