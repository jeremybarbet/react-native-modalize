# Development

If you want to add a new feature or fix an issue, you can run the _examples_ folder to test your changes. Each example are using the local `Modalize` component from the `src` folder.

---

#### React Native Navigation

```bash
cd examples/react-native-navigation
yarn
npx pod-install ios
yarn start
```

```bash
cd examples/react-native-navigation
yarn ios # or android
cd ../..
yarn watch:react-native-navigation
```

---

#### React Navigation

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

---

#### Expo

```bash
cd examples/expo
yarn
yarn start
```

```bash
yarn watch:expo
```

?> This example is also running in the browser thanks to `react-native-web` and you can try it by doing `yarn web` instead of `yarn start`.
