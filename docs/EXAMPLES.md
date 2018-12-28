# Examples

As explained [here](./PROPSMETHODS?id=withreactmodal), it's not recommanded to use the `withReactModal` props. React Native team will soon remove from the core of React Native a lot of components, like the `Modal` one. It's unstable and not performing well.

This is why most of the major router implemented their way to handle a modal/overlay behavior.

## React Native Navigation

This is probably the simplest router to handle this bevahior. There is a method called `showOverlay` that will open any screen you want on top of the current screen.

You can run the example by doing:

```bash
cd examples/react-native-navigation
yarn
yarn start
react-native run-ios
```

## React Navigation

WIP

EXPO LINK

You can run the example by doing:

```bash
cd examples/react-navigation
yarn
yarn start
```


## React Native Expo

This example is just using the simplest Expo configuration without any router. Besides, `Modalize` is not using the `withReactModal` props, depending where you include the modal, it might be overlay with another component, because it's related to its parent: `{ positon: 'absolute, top: 0, right: 0, bottom: 0, left: 0 }`.

EXPO LINK

You can run the example by doing:

```bash
cd examples/react-native-expo
yarn
yarn start
```
