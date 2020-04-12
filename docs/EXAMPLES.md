# Examples

These examples are running on 3 of the most popular navigator for react-native.

## React Native Navigation

Instead of using react-native's modal to display Modalize on top of your content all the time. `react-native-navigation` have their own way to display content on top of the rest, which is called `showOverlay`. This example show you how it works.

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### First tab
```bash
cd examples/react-native-navigation
yarn
yarn start
```

#### Second tab
```bash
cd examples/react-native-navigation
yarn ios # or android
cd ../..
yarn watch:react-native-navigation
```
</p>
</details>

## React Navigation

This example use react-navigation with a bottom tabs navigation. To be able to render Modalize on top of all the rest (and especially the bottom tabs) you will need to install the package [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize). You can follow the example to see how it is used.

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### First tab
```bash
cd examples/react-navigation
yarn
npx pod-install ios
yarn start
```

#### Second tab
```bash
cd examples/react-navigation
yarn ios # or android
cd ../..
yarn watch:react-navigation
```
</p>
</details>

## Expo

This example is runing under Expo without any navigator.

?> An Expo app is avalaible at the [following link](https://exp.host/@jeremdsgn/react-native-modalize).

<details>
<summary><strong>Runing the example</strong></summary>
<p>

#### First tab
```bash
cd examples/expo
yarn
yarn start
```

#### Second tab
```bash
cd ../..
yarn watch:expo
```
</p>
</details>
