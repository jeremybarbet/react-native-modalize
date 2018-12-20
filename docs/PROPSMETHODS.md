## Props

### `children`

Something nice inside (or not, up to you).

| Type     | Required |
| -------- | -------- |
| node     | Yes      |

### `style`

If you want to style the modal, you can pass a style object.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `handlePosition`

The handle's position on top of the modal.

| Type     | Required | Default   |
| -------- | -------- | --------- |
| string   | No       | `outside` |

### `handleStyle`

If you want to style the handle, you can pass a style object.

| Type     | Required |
| -------- | -------- |
| style     | No      |

### `overlayStyle`

If you want to style the overlay, you can pass a style object.

| Type     | Required |
| -------- | -------- |
| style     | No      |

### `height`

By providing a value to the `height` props it enable the snapping feature. The value you pass is a number that determines how much the modal should be open before being full height. In short, tt's a two steps process to open the modal.

| Type     | Required |
| -------- | -------- |
| number   | Yes      |

### `useNativeDriver`

Because it's better to use the UI thread and make animations smoother.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `adjustToContentHeight`

Shrink the modal to content's height. `Modalize` can calculate for you if your content is taller than the max height or not, it it's not it will shrink the height of the modal to adapt it to your content's height.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | Yes      | `false`  |

### `showsVerticalScrollIndicator`

Do not show the indicator for the scrollview.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | Yes      | `false`  |

### `withReactModal`

To use React Modal to wrap Modalize.

Most of application are now using a router, either [react-navigation](https://snack.expo.io/@react-navigation/full-screen-modal-v3), [react-native-navigation](https://wix.github.io/react-native-navigation/#/docs/top-level-api?id=showoverlaylayout-) or others. On all of these libraries, there is something similar to `openOverlay` that will open a screen on top of your content. It's recommanded to wrap `Modalize` into it.

?> Since the `Modal` component from `react-native` will be move out of the core soon, it's not well maintain anymore. Besides, it doesn't work well along with `react-native-gesture-handler`. That's why the `withReactModal` props is only avaiable on iOS and not recommanded to use.

| Type     | Required | Default  | Platform |
| -------- | -------- | -------- | -------- |
| bool     | No       | `false`  | iOS      |

### `withHandle`

To hide the handle if you don't want it.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `header`

A fixed header component on top of the modal.

- If your header has to be at the top of the modal, without floating on the content you pass `isAbsolute: false`
- If your header has to float on top of the content, like a close squared button, you have to `isAbsolute: true`. It will skip the height calculation of the header and avoid to change the scrollview height.

?> Don't forget to specify the `isAbsolute` props when defining an header.

| Type                                          | Required |
| --------------------------------------------- | -------- |
| object: { component: node, isAbsolute: bool } | No       |

### `footer`

A fixed footer component on top of the modal. See above for the details about the props.

| Type                                          | Required |
| --------------------------------------------- | -------- |
| object: { component: node, isAbsolute: bool } | No       |

### `onOpen`

Called when the `open` method is used.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onOpened`

Called when the modal is opened.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onClose`

Called when the `close` method is used.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onClosed`

Called when the modal is closed.

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
