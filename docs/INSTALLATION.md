# Installation

- Install `react-native-modalize`

```bash
yarn add react-native-modalize
```

- Modalize also needs `react-native-gesture-handler`

```bash
yarn add react-native-gesture-handler
npx pod-install ios
```

No other step is required. That's it!

<details>
<summary><strong>Additional setup for Modalize `< 1.3.7-rc.18`</strong></summary>
<p>
If you are using Modalize <code>< 1.3.7-rc.18</code> and not running on Expo, you will need to follow <a href="https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html">react-native-gesture-handler's setup guide</a> to complete the installation and wrap your application with the <code>GestureHandlerRootView</code>. It's automatically done in newest versions of the library.
</p>
</details>

