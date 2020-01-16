# Examples

These three examples are made to show you:

- How to use the modal using different navigators
- How to avoid using the Modal from React Native
- The best practices to display Modalize

?> React Native team will soon remove from the core a lot of components, including the `Modal`. This is why it's not recommended to use [withReactModal](/PROPSMETHODS?id=withreactmodal) props.

?> Most of the major navigators implemented theirs owns ways to handle the modal/overlay behavior. `react-native-navigation` uses the `showOverlay` method and `react-navigation` uses a StackRoot to create the modal route.

## React Native Navigation

This is probably the simplest navigator to handle this bevahior. There is a method called `showOverlay` that will open the Modalize screen on top of the current screen.

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### Tab #1
```bash
cd examples/react-native-navigation
yarn
yarn start
```

#### Tab #2
```bash
cd examples/react-native-navigation
yarn ios (or android)
cd ../
yarn watch:react-native-navigation
```
</p>
</details>

## React Navigation

This example use react-navigation. Modalize is used on the screen you need to toggle it.

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### Tab #1
```bash
cd examples/react-navigation
yarn
yarn start
```

#### Tab #2
```bash
cd examples/react-navigation
yarn ios (or android)
cd ../
yarn watch:react-navigation
```
</p>
</details>

## Expo

This example is runing under Expo without any navigator. Also, in this example `withReactModal` is `false`, which mean the Modal might be displayed under another component depending where you use it.

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### Tab #1
```bash
cd examples/expo
yarn
yarn start
```

#### Tab #2
```bash
cd ../
yarn watch:expo
```
</p>
</details>

?> An Expo app is avalaible at the [following link](https://exp.host/@jeremdsgn/react-native-modalize).
