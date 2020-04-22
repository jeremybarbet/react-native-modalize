# Available props

All these props are available by passing them to the Modalize component.

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => (
  <Modalize
    ref={modalizeRef}
    scrollViewProps={{ showsVerticalScrollIndicator: false }}
    snapPoint={300}
    HeaderComponent={<View><Text>Header</Text></View>}
    withHandle={false}
  >
    ...your content
  </Modalize>
);
```

## Renderers

Modalize is shipped by default with three different renderers. The default one is a ScrollView and you just have to pass your content without specifying it directly. If you want to use a FlatList or a SectionList, then you don't have to pass the `children` props, but the `data`/`renderItem` that you can normally find with both of them.

### `children`

A React component that will define the content of the modal. By passing a children props it will use the default `ScrollView` component.

| Type     | Required |
| -------- | -------- |
| node     | No       |

### `scrollViewProps`

An object to pass any of the react-native ScrollView's props.

Refer to the [`react-native` ScrollView documentation](https://reactnative.dev/docs/scrollview#props) to find out all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `flatListProps`

An object to pass any of the react-native FlatList's props. Using this props will replace the default `ScrollView` with the `FlatList` component.

Refer to the [`react-native` FlatList documentation](https://reactnative.dev/docs/flatlist#props) to find out all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

### `sectionListProps`

An object to pass any of the react-native SectionList's props. Using this props will replace the default `ScrollView` with the `SectionList` component.

Refer to the [`react-native` SectionList documentation](https://reactnative.dev/docs/sectionlist#props) to find out all the avaibles props.

| Type     | Required |
| -------- | -------- |
| object   | No       |

## Styles

Multiple objects way to style the different part of Modalize.

### `modalStyle`

Define the style of the modal (includes handle/header/children/footer).

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `handleStyle`

Define the style of the handle on top of the modal.

!> Be aware that if you change the height of the handle, the modal height won't change. It's not dynamic yet, feel free to open a PR to fix that.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `overlayStyle`

Define the style of the overlay.

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `childrenStyle`

Define the style of the children renderer (only the inside part).

| Type     | Required |
| -------- | -------- |
| style    | No       |

### `modalElevation`

A number to define the elevation of the modal on Android. Useful if you have other elements of your app using other values of elevation.

| Type     | Required | Platform |
| -------- | -------- | -------- |
| number   | No       | Android  |

## Layout

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

### `modalTopOffset`

A number to define the modal's top offset.

| Type     | Required |
| -------- | -------- |
| number   | No       |

### `alwaysOpen`

A number that will make the modal visible all the time. You can still [open](/PROPSMETHODS.md?id=open) and [close](/PROPSMETHODS.md?id=close) it, using the build-in methods.

The value you pass is the height of the visible part of the modal on top of the screen.

| Type     | Required |
| -------- | -------- |
| number   | No       |

### `adjustToContentHeight`

Shrink the modal to your content's height.

`Modalize` can calculate for you if your content is taller than the max height or not, if it isn't, it will adapt the height of the modal to fit your content.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `false`  |

## Options

### `handlePosition`

Define where the handle on top of the modal should be positioned.

| Type                      | Required | Default   |
| ------------------------- | -------- | --------- |
| enum('outside', 'inside') | No       | `outside` |

### `disableScrollIfPossible`

Disable the scroll when the content is shorter than screen's height.

| Type     | Required | Default |
| -------- | -------- | ------- |
| number   | No       | `true`  |

### `avoidKeyboardLikeIOS`

Define keyboard's Android behavior like iOS's one.

| Type     | Required | Default                                          |
| -------- | -------- | ------------------------------------------------ |
| bool     | No       | `Platform.select({ ios: true, android: false })` |

### `keyboardAvoidingBehavior`

Define the behavior of the modal when keyboard is active.

If you have any inputs inside your cont and you want to manage how the view should change when the keyboard is active. See [`react-native` documentation](https://reactnative.dev/docs/keyboardavoidingview#behavior) for more information.

| Type                                  | Required | Default   |
| ------------------------------------- | -------- | --------- |
| enum('height', 'position', 'padding') | No       | `padding` |

### `keyboardAvoidingOffset`

See [`react-native` documentation](https://reactnative.dev/docs/keyboardavoidingview#keyboardverticaloffset) for more information.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| number   | No       | `0`      |

### `panGestureEnabled`

Using this prop will enable/disable pan gesture.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `closeOnOverlayTap`

Using this prop will enable/disable the overlay tap gesture.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

## Animations

### `openAnimationConfig`

Object to change the open animation. You can either pass a timing (`Animated.timing`) or a spring (`Animated.spring`) animation.

| Type     | Required | Default                                    |
| -------- | -------- | ------------------------------------------ |
| object   | No       | `{ spring: { speed: 14, bounciness: 4 } }` |

**Spring props (default object)**

- `friction`: Controls "bounciness"/overshoot.
- `tension`: Controls speed.
- `speed`: Controls speed of the animation. _Default 14_.
- `bounciness`: Controls bounciness. _Default 4_.
- `stiffness`: The spring stiffness coefficient.
- `damping`: Defines how the spring’s motion should be damped due to the forces of friction.
- `mass`: The mass of the object attached to the end of the spring.

**Timing props**

- `duration`: Length of animation (milliseconds). _Default 280_.
- `easing`: Easing function to define curve. _Default is `Easing.ease`_.
- `delay`: Start the animation after delay (milliseconds).
- `isInteraction`: Whether or not this animation creates an "interaction handle" on the InteractionManager.

### `closeAnimationConfig`

Object to change the close animation. You can either pass a timing (`Animated.timing`) or a spring (`Animated.spring`) animation. _(See above for spring and timing props)_

| Type     | Required | Default                                    |
| -------- | -------- | ------------------------------------------ |
| object   | No       | `{ spring: { speed: 14, bounciness: 5 } }` |

### `dragToss`

A number that determines the momentum of the scroll required.

| Type     | Required | Default |
| -------- | -------- | ------- |
| number   | No       | `0.05`  |

### `threshold`

Number of pixels that the user must pass to be able to close the modal.

| Type     | Required | Default |
| -------- | -------- | ------- |
| number   | No       | `150`   |

### `velocity`

Speed at which the user has to pan down to close the modal.

The highest the number is, the faster the user will need to pan down and make an important gesture to dismiss the modal.

?> e.g. When the user is reaching the top of the ScrollView and is immediately panning down to dismiss Modalize. If it reaches the velocity threshold then it instantly closes the modal.

?> If the `velocity` is defined, then it's the first condition checked to close Modalize, then comes `threshold` used in a second time. If you want to use the `threshold` method only, just define `velocity={undefined}`.

| Type               | Required | Default |
| ------------------ | -------- | ------- |
| number | undefined | No       | `2800`  |

### `panGestureAnimatedValue`

Animated.Value of the modal opening position between 0 and 1.

| Type               | Required |
| ------------------ | -------- |
| Animated.Value     | No       |

### `useNativeDriver`

Wether or not you want to use the native driver with the `panGestureAnimatedValue`.

!> It's not really recommanded to set it to `false`, but sometimes you don't have choice, so this option is here for that.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

## Elements visibilities

### `withReactModal`

Define if `Modalize` has to be wrap with the Modal component from react-native.

?> In order to work on Android you will need at least `react-native-gesture-handler >= 1.6.0`.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `false`  |

### `withHandle`

Define if the handle on top of the modal is display or not.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

### `withOverlay`

Define if the overlay is display or not.

| Type     | Required | Default  |
| -------- | -------- | -------- |
| bool     | No       | `true`   |

## Additional components

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

### `FloatingComponent`

A floating component inside the modal wrapper that will be independent of scrolling. It requires `zIndex` child with absolute positioning. Check out the [Flatlist example](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/FlatList.js#L29-L33).

| Type     | Required |
| -------- | -------- |
| node     | No       |

## Callbacks

Pass any callbacks to them and you will be able to get changes they are taking care of.

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

### `onBackButtonPress`

onBackButtonPress is called when the user taps the hardware back button on Android or the menu button on Apple TV. You can any function you want, but you will have to close the modal by yourself.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onPositionChange`

Callback function when the modal reaches the `top` (modal/screen height) or `initial` point (snapPoint or alwaysOpen height).

?> Not to be confused with `onOpened` which is triggered when the modal opens for the first time.

| Type                                     | Required |
| ---------------------------------------- | -------- |
| function: (position: 'top' \| 'initial') | No       |

### `onOverlayPress`

Callback used when you press the overlay.

| Type     | Required |
| -------- | -------- |
| function | No       |

### `onLayout`

Callback to subscribe to layout changes. Return the `LayoutRectangle` object from react-native.

| Type                                                                                         | Required |
| -------------------------------------------------------------------------------------------- | -------- |
| function: (nativeEvent: { layout: { height: number, width: number, x: number, y: number } }) | No       |
