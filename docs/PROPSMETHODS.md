## Props

### `children`

A React component that will define the content of the modal.

By passing a children props it will use the default `ScrollView` component. However, if you want to use a `FlatList` or a `SectionList` check the details [here](/PROPSMETHODS.md?id=flatListProps) and [here](/PROPSMETHODS.md?id=sectionListProps).

?> If you want to use another ScrollView inside the modal, check the **Default Content** example: `examples/expo/src/modals/SimpleContent.tsx`. It uses the ScrollView from `react-native-gesture-handler`.

| Type     | Required |
| -------- | -------- |
| node     | No       |

### `snapPoint`

A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.

The value you pass is the height of the modal before being full opened.

| Type     | Required |
| -------- | -------- |
| number   | No       |

### `modalHeight`

A number to define the modal's total height.

| Type     | Required |
| -------- | -------- |
| number   | No       |

### `alwaysOpen`

A number that will make the modal visible all the time. You can still [open](/PROPSMETHODS.md?id=open) and [close](/PROPSMETHODS.md?id=close) it, using the build-in methods.

The value you pass is the height of the visible part of the modal on top of the screen.

| Type     | Required |
| -------- | -------- |
| number   | No       |

### `handlePosition`

Define where the handle on top of the modal should be positioned.

| Type                      | Required | Default   |
| ------------------------- | -------- | --------- |
| enum('outside', 'inside') | No       | `outside` |

### `modalStyle`

Define the style of the modal.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `handleStyle`

Define the style of the handle on top of the modal.

?> Be aware that if you change the height of the handle, the modal height won't change. It's not dynamic yet, and it will be in the future.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `overlayStyle`

Define the style of the overlay.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `useNativeDriver`

Use the native thread by default to execute the animations.

It's not really recommanded to set it to `false`, but sometimes you don't have choice, so this option is here for that.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `openAnimationConfig`

Object to change the open animations. You can either pass a timing (`Animated.timing`) or a spring (`Animated.spring`) animation.

| Type     | Required | Default                                    |
| -------- | -------- | ------------------------------------------ |
| object   | No       | `{ spring: { speed: 14, bounciness: 4 } }` |

### `closeAnimationConfig`

Object to change the close animations. You can either pass a timing (`Animated.timing`) or a spring (`Animated.spring`) animation.

| Type     | Required | Default                                    |
| -------- | -------- | ------------------------------------------ |
| object   | No       | `{ spring: { speed: 14, bounciness: 5 } }` |

### `adjustToContentHeight`

Shrink the modal to your content's height.

`Modalize` can calculate for you if your content is taller than the max height or not, if it isn't, it will adapt the height of the modal to fit your content.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `false`  |

### `avoidKeyboardLikeIOS`

Define keyboard's Android behavior like iOS's one.

| Type     | Required | Default                                          |
| -------- | -------- | ------------------------------------------------ |
| bool     | No       | `Platform.select({ ios: true, android: false })` |

### `keyboardAvoidingBehavior`

Define the behavior of the modal when keyboard is active.

If you have any inputs inside your cont and you want to manage how the view should change when the keyboard is active. See [`react-native` documentation](https://facebook.github.io/react-native/docs/keyboardavoidingview#behavior) for more informations.

| Type                                  | Required | Default   |
| ------------------------------------- | -------- | --------- |
| enum('height', 'position', 'padding') | No       | `padding` |

### `keyboardAvoidingOffset`

See [`react-native` documentation](https://facebook.github.io/react-native/docs/keyboardavoidingview#keyboardverticaloffset) for more informations.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| number   | No       | `0`      |

### `panGestureEnabled`

Using this prop will enable/disable pan gesture

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `closeOnOverlayTap`

Using this prop will enable/disable overlay tap gesture

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `withReactModal`

Define if `Modalize` has to be wrap with the Modal component from react-native.

!> Using this props, or wrapping `Modalize` with the `Modal` from `react-native` will break the swipe gestures. This is a known issue from [`react-native-gesture-handler` #139](https://github.com/kmagiera/react-native-gesture-handler/issues/139).

?> It's not recommended to pass it at `true`. Check the [examples' documentation](/EXAMPLES.md) to find the other ways to handle it.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `false`  |

### `withHandle`

Define if the handle on top of the modal is display or not.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `scrollViewProps`

An object to pass any of the react-native ScrollView's props.

Refer to the [`react-native` ScrollView documentation](https://facebook.github.io/react-native/docs/#props) to know all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `flatListProps`

An object to pass any of the react-native FlatList's props. Using this props will replace the default `ScrollView` with the `FlatList` component.

Refer to the [`react-native` FlatList documentation](https://facebook.github.io/react-native/docs/flatlist#props) to know all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `sectionListProps`

An object to pass any of the react-native SectionList's props. Using this props will replace the default `ScrollView` with the `SectionList` component.

Refer to the [`react-native` SectionList documentation](https://facebook.github.io/react-native/docs/sectionlist#props) to know all the avaibles props.

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

### `onPositionChange`

Callback function when the modal reaches the `top` (modal/screen height) or `initial` point (snapPoint or alwaysOpen height).

?> Not to be conflicted with `onOpened` which is triggered when the modal opens for the first time.

| Type                                    | Required |
| --------------------------------------- | -------- |
| function: (position: 'top' \| 'initial') | No       |



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

?> If you are using `alwaysOpen` props, you can supply a `dest` argument to the `close` method to reset it to the intial position  `close('alwaysOpen')`, and avoiding to close it completely.

| Type                                       | Required |
| ------------------------------------------ | -------- |
| function: (dest: 'alwaysOpen' \| 'default') | No       |

### `scrollTo()`

The method is used to programmatically scroll the modal content.

| Type                                                  | Required |
| ----------------------------------------------------- | -------- |
| function: (options: { y: number, animated: boolean }) | No       |
