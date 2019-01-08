## Props

### `children`

A React component that will define the content of the modal.

Modalize is built-in with a `ScrollView` which mean you don't need to pass one. Even though, if you need another one inside, you can pass a `ScrollView`. But for this, you need to use:

```jsx
import { ScrollView } from 'react-native-gesture-handler';
```

?> Check the `Default Content` example to see use of multiples scrollviews: `examples-shared/src/components/modals/DefaultContent.tsx`.

| Type     | Required |
| -------- | -------- |
| node     | Yes      |

### `height`

A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.

The value you pass is the height of the modal before being full opened.

| Type     | Required |
| -------- | -------- |
| number   | Yes      |

### `handlePosition`

Define where the handle on top of the modal should be positioned.

| Type                      | Required | Default   |
| ------------------------- | -------- | --------- |
| enum('outside', 'inside') | No       | `outside` |

### `style`

Define the style of the modal.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `handleStyle`

Define the style of the handle on top of the modal.

?> Be aware that if you change the height of the handle, the modal height won't change. It's not dynamic yet, and it will be in the future.

| Type     | Required |
| -------- | -------- |
| style     | No      |

### `overlayStyle`

Define the style of the overlay.

| Type     | Required |
| -------- | -------- |
| style     | No      |

### `useNativeDriver`

Use the native thread by default to execute the animations.

It's not really recommanded to set it to `false`, but sometimes you don't have choice, so this option is here for that.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `adjustToContentHeight`

Shrink the modal to your content's height.

`Modalize` can calculate for you if your content is taller than the max height or not, if it isn't, it will adapt the height of the modal to fit your content.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | Yes      | `false`  |

### `showsVerticalScrollIndicator`

Define if you want to toggle the vertical scroll indicator.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | Yes      | `false`  |

### `keyboardShouldPersistTaps`

Define the behavior of the keyboard when having inputs inside the modal.

If you have any inputs inside your cont and you want to manage how to dismiss the keyboard. See [`react-native` documentation](https://facebook.github.io/react-native/docs/scrollview#keyboardshouldpersisttaps) for more informations.

| Type                               | Required | Default  |
| ---------------------------------- | -------- | -------- |
| enum('never', 'always', 'handled') | No       | `never`  |

### `withReactModal`

Define if `Modalize` has to be wrap with the Modal component from react-native.

?> It's not recommended to pass it at `true`. Check the [examples' documentation](/EXAMPLES.md) to find the best way to handle it.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `false`  |

### `withHandle`

Define if the handle on top of the modal is display or not.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `scrollViewProps`

An object to pass any of the react-native scroll view's props.

Refer to the [`react-native` scroll view documentation](https://facebook.github.io/react-native/docs/scrollview#props) to know all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `flatListProps`

An object to pass any of the react-native flat list's props and replace the scrollview with it.

Refer to the [`react-native` flat list documentation](https://facebook.github.io/react-native/docs/flatlist#props) to know all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `sectionListProps`

An object to pass any of the react-native section list's props and replace the scrollview with it.

Refer to the [`react-native` section list documentation](https://facebook.github.io/react-native/docs/sectionlist#props) to know all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `HeaderComponent`

A header component outside of the ScrollView, at the top of the modal.

| Type     | Required |
| -------- | -------- |
| node     | No       |

### `FooterComponent`

A footer component outside of the ScrollView, at the bottom of the modal.

| Type     | Required |
| -------- | -------- |
| node     | No       |

### `onOpen`

Callback function when the `open` method is triggered.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onOpened`

Callback function when the modal is opened.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onClose`

Callback function when the `close` method is triggered.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onClosed`

Callback function when the modal is closed.

| Type     | Required |
| -------- | -------- |
| function | No       |

<br/>
<br/>
<br/>
<br/>

## Methods

### `open()`

The method to open the modal.

| Type     | Required  |
| -------- | --------- |
| function | Yes       |

### `close()`

The method to close the modal. You don't need to call it to dismiss the modal, since you can swipe down to dismiss.

| Type     | Required |
| -------- | -------- |
| function | No       |
