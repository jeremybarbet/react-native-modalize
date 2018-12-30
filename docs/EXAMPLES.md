# Examples

As explained [here](./PROPSMETHODS?id=withreactmodal), it's not recommanded to use the `withReactModal` props. React Native team will soon remove from the core a lot of components, and the `Modal` is one of them.

This is why most of the major navigator implemented their owns ways to handle the modal/overlay behaviors. Both `react-native-navigation` and `react-navigation` examples are made using a bottom tabbar because it's a very common design pattern. But you can also find an example without any navigation under the `react-native-expo` folder.

?> All the modals, layout, text and buttons are shared between the different examples to make it easier to maintain. You can find the code in `examples/shared` folder.

!> For the moment, each examples are using the shared folder using a npm path `"shared": "file:../shared",`. There isn't any live-reload solution yet to change the shared folder and modifify instantly the examples folders. So you will have to remove the `node_modules` from the example folder after you finished to change the `shared` folder.

## React Native Navigation

This is probably the simplest navigator to handle this bevahior. There is a method called `showOverlay` that will open any screen you want on top of the current screen.

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
