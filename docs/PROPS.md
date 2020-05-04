# Available props

All these props are available by passing them to the Modalize component.

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Modalize } from 'react-native-modalize';

export const App = () => (
  <Modalize
    scrollViewProps={{ showsVerticalScrollIndicator: false }}
    snapPoint={300}
    HeaderComponent={
      <View>
        <Text>Header</Text>
      </View>
    }
    withHandle={false}
  >
    ...your content
  </Modalize>
);
```

---

#### Known limitations:

- Modalize uses internally `onScrollBeginDrag` method to be able to handle the swipe gestures. If you decide to use it on your side with `scrollViewProps`, `flatListProps` or `sectionListProps` object, you will only have access to the listener of the `onScrollBeginDrag` method as you can see [here](https://github.com/jeremybarbet/react-native-modalize/blob/master/src/index.tsx#L611) and not the whole event like default.

- Because of a limitation with react-native-gesture-handler, `HeaderComponent`, `FooterComponent` and `FloatingComponent` are not wrapped with a PanGestureHandler on Android, which mean you cannot dismiss Modalize by swiping down on these three components. If enabled, the inner events you could have in your components (e.g. TouchableOpacity, ScrollView) are cancels and don't work. Opposed to iOS that works just fine.

- When using some third-party library (e.g. expo-av/react-native-video), it's impossible to press any of the native controls. This is a limitation created by the `TapGestureHandler` wrapping the whole Modalize's core component. In short, we need it to make sure we don't scroll and swipe at the same time. As a workaround, we now have a props `tapGestureEnabled` to be able to disable it and press in your third-party library. The only downside that can appear when using `tapGestureEnabled: false` is when you use it along with `snapPoint` props. The ScrollView could be triggered, for a few pixels, at the same time as the swipe gesture.

- If you are using a `TextInput` component inside your Modalize, it seems to be intercepting all touch events. You can follow this issue on both [#123](https://github.com/jeremybarbet/react-native-modalize/issues/123) and [#668](https://github.com/software-mansion/react-native-gesture-handler/issues/668).

## Refs

### `ref`

A ref on Modalize component to be able to use the internal methods [`open()`](/METHODS.md?id=open) and [`close()`](/METHODS.md?id=close).

```tsx
import { Modalize } from 'react-native-modalize';

const App = () => {
  const modalizeRef = useRef<Modalize>(null);

  // e.g. modalizeRef.current?.open() or modalizeRef.current?.close()

  return <Modalize ref={modalizeRef} />;
};
```

| Type            | Required |
| --------------- | -------- |
| React.RefObject | Yes      |

### `contentRef`

A reference to the view (ScrollView, FlatList, SectionList) that provides the scroll behavior, where you will be able to access their owns methods.

The reference will change depending of the props you are using:

- `children`/`scrollViewProps` -> ScrollView [methods](https://reactnative.dev/docs/scrollview#methods), [types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-native/index.d.ts#L6520-L6560)
- `flatListProps` -> FlatList [methods](https://reactnative.dev/docs/flatlist#methods), [types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-native/index.d.ts#L4084-L4139)
- `sectionListProps` -> SectionList [methods](https://reactnative.dev/docs/sectionlist#methods), [types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-native/index.d.ts#L4322-L4353)

```tsx
import { Modalize } from 'react-native-modalize';
import { ScrollView, Animated } from 'react-native';

const App = () => {
  const contentRef = useRef<Animated.AnimatedComponent<ScrollView>>(null);

  // e.g. contentRef.current?.getScrollResponder().scrollTo(...);

  return <Modalize contentRef={contentRef} />;
};
```

To get the types from TypeScript, you will need to do like below. Since the content renderer is wrapped with an Animated component you need to extends it with the AnimatedComponent type.

To find the path to each of the function it will depend what content renderer you are using and which version of `react-native` you are running. On latest `react-native`, it should be like in the example above: `contentRef.getScrollResponder().scrollTo(...)` or `contentRef.getScrollResponder().scrollToIndex(...)`, etc.. On older version, most likely something like `contentRef.getNode().getScrollResponder().scrollTo(...)`.

| Type            | Required |
| --------------- | -------- |
| React.RefObject | No       |

## Renderers

Modalize is shipped by default with four different renderers. The default one is a ScrollView and you just have to pass your content without specifying it directly. If you want to use a FlatList or a SectionList, then you don't have to pass the `children` props, but the `data`/`renderItem` that you can normally find with both of them. You also have the possibility to pass your `customRenderer` with this props.

### `children`

A React node that will define the content of the modal. By passing a children props it will use the default `ScrollView` component.

| Type | Required |
| ---- | -------- |
| node | No       |

### `scrollViewProps`

An object to pass any of the react-native ScrollView's props.

Refer to the [`react-native` ScrollView documentation](https://reactnative.dev/docs/scrollview#props) to find out all the available props.

| Type   | Required |
| ------ | -------- |
| object | No       |

### `flatListProps`

An object to pass any of the react-native FlatList's props. Using this props will replace the default `ScrollView` with the `FlatList` component.

Refer to the [`react-native` FlatList documentation](https://reactnative.dev/docs/flatlist#props) to find out all the available props.

| Type   | Required |
| ------ | -------- |
| object | No       |

### `sectionListProps`

An object to pass any of the react-native SectionList's props. Using this props will replace the default `ScrollView` with the `SectionList` component.

Refer to the [`react-native` SectionList documentation](https://reactnative.dev/docs/sectionlist#props) to find out all the available props.

| Type   | Required |
| ------ | -------- |
| object | No       |

### `customRenderer`

An animated custom React node that will inherit of the onScroll/gesture events

!> You must pass an animated component, either by doing e.g. `<Animated.View ...>` or `const AnimatedCustomComponent = Animated.createAnimatedComponent(CustomComponent);`.

| Type | Required |
| ---- | -------- |
| node | No       |

## Styles

Multiple objects way to style the different part of Modalize.

### `rootStyle`

Define the style of the root modal component.

| Type  | Required |
| ----- | -------- |
| style | No       |

### `modalStyle`

Define the style of the modal (includes handle/header/children/footer).

| Type  | Required |
| ----- | -------- |
| style | No       |

### `handleStyle`

Define the style of the handle on top of the modal.

!> Be aware that if you change the height of the handle, the modal height won't change. It's not dynamic yet, feel free to open a PR to fix that.

| Type  | Required |
| ----- | -------- |
| style | No       |

### `overlayStyle`

Define the style of the overlay.

| Type  | Required |
| ----- | -------- |
| style | No       |

### `childrenStyle`

Define the style of the children renderer (only the inside part).

| Type  | Required |
| ----- | -------- |
| style | No       |

## Layout

### `snapPoint`

A number that will enable the snapping feature and create an intermediate point before opening the modal to full screen.

The value you pass is the height of the modal before being full opened.

| Type   | Required |
| ------ | -------- |
| number | No       |

### `modalHeight`

A number to define the modal's total height.

| Type   | Required |
| ------ | -------- |
| number | No       |

### `modalTopOffset`

A number to define the modal's top offset.

| Type   | Required |
| ------ | -------- |
| number | No       |

### `alwaysOpen`

A number that will make the modal visible all the time. You can still [`open()`](/METHODS.md?id=open) and [`close()`](/METHODS.md?id=close) it, using the build-in methods.

The value you pass is the height of the visible part of the modal on top of the screen.

| Type   | Required |
| ------ | -------- |
| number | No       |

### `adjustToContentHeight`

Shrink the modal to your content's height.

`Modalize` can calculate for you if your content is taller than the max height or not, if it isn't, it will adapt the height of the modal to fit your content.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `false` |

## Options

### `handlePosition`

Define where the handle on top of the modal should be positioned.

| Type                      | Required | Default   |
| ------------------------- | -------- | --------- |
| enum('outside', 'inside') | No       | `outside` |

### `disableScrollIfPossible`

Disable the scroll when the content is shorter than screen's height.

| Type   | Required | Default |
| ------ | -------- | ------- |
| number | No       | `true`  |

### `avoidKeyboardLikeIOS`

Define keyboard's Android behavior like iOS's one.

| Type | Required | Default                                          |
| ---- | -------- | ------------------------------------------------ |
| bool | No       | `Platform.select({ ios: true, android: false })` |

### `keyboardAvoidingBehavior`

Define the behavior of the modal when keyboard is active.

If you have any inputs inside your cont and you want to manage how the view should change when the keyboard is active. See [`react-native` documentation](https://reactnative.dev/docs/keyboardavoidingview#behavior) for more information.

| Type                                  | Required | Default   |
| ------------------------------------- | -------- | --------- |
| enum('height', 'position', 'padding') | No       | `padding` |

### `keyboardAvoidingOffset`

See [`react-native` documentation](https://reactnative.dev/docs/keyboardavoidingview#keyboardverticaloffset) for more information.

| Type   | Required | Default |
| ------ | -------- | ------- |
| number | No       | `0`     |

### `panGestureEnabled`

Using this prop will enable/disable pan gesture.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

### `panGestureComponentEnabled`

Define if HeaderComponent/FooterComponent/FloatingComponent should have pan gesture enable (Android specific).

!> Because of a limitation from `react-native-gesture-handler` for Android, when enable it might break touchable inside the view, that's why it's false by default. e.g. you might need to use `TouchableOpacity` from RNGH for Android and `TouchableOpacity` from `react-native` for iOS if set to `true`.

| Type | Required | Default | Platform |
| ---- | -------- | ------- | -------- |
| bool | No       | `false` | Android  |

### `tapGestureEnabled`

Define if the `TapGestureHandler` wrapping Modalize's core should be enable or not.

This wrapper is used to disable/enable the ScrollView when swiping and scrolling to not trigger both at the same time.

?> If you are using a third-library and the touch events are not working, you will most likely want to pass this props to `false` to able to propagate the events down.

!> If you are using `snapPoint` props and have to use to pass this props to `false`, it may, when in initial position, swipe and scroll both Modalize and the ScrollView inside at the same time.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

### `closeOnOverlayTap`

Using this prop will enable/disable the overlay tap gesture.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

### `closeSnapPointStraightEnabled`

Define if `snapPoint` props should close straight when swiping down or come back to initial position.

?> However, if the velocity value is reached it will close Modalize straight, even when `false`.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

## Animations

### `openAnimationConfig`

Object to change the open animation. You can either pass a timing (`Animated.timing`) or a spring (`Animated.spring`) animation.

| Type   | Required | Default                                    |
| ------ | -------- | ------------------------------------------ |
| object | No       | `{ spring: { speed: 14, bounciness: 4 } }` |

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

| Type   | Required | Default                                    |
| ------ | -------- | ------------------------------------------ |
| object | No       | `{ spring: { speed: 14, bounciness: 5 } }` |

### `dragToss`

A number that determines the momentum of the scroll required.

| Type   | Required | Default |
| ------ | -------- | ------- |
| number | No       | `0.05`  |

### `threshold`

Number of pixels that the user must pass to be able to close the modal.

| Type   | Required | Default |
| ------ | -------- | ------- |
| number | No       | `150`   |

### `velocity`

Speed at which the user has to pan down to close the modal.

The highest the number is, the faster the user will need to pan down and make an important gesture to dismiss the modal.

?> e.g. When the user is reaching the top of the ScrollView and is immediately panning down to dismiss Modalize. If it reaches the velocity threshold then it instantly closes the modal.

?> If the `velocity` is defined, then it's the first condition checked to close Modalize, then comes `threshold` used in a second time. If you want to use the `threshold` method only, just define `velocity={undefined}`.

| Type   | Required  | Default |
| ------ | --------- | ------- |
| number | undefined | No      | `2800` |

### `panGestureAnimatedValue`

Animated.Value of the modal opening position between 0 and 1.

| Type           | Required |
| -------------- | -------- |
| Animated.Value | No       |

### `useNativeDriver`

Wether or not you want to use the native driver with the `panGestureAnimatedValue`.

!> It's not really recommended to set it to `false`, but sometimes you don't have choice, so this option is here for that.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

## Elements visibilities

### `withReactModal`

Define if `Modalize` has to be wrap with the Modal component from react-native.

?> In order to work on Android you will need at least `react-native-gesture-handler >= 1.6.0`.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `false` |

### `withHandle`

Define if the handle on top of the modal is display or not.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

### `withOverlay`

Define if the overlay is display or not.

| Type | Required | Default |
| ---- | -------- | ------- |
| bool | No       | `true`  |

## Additional components

### `HeaderComponent`

A header component outside of the ScrollView, at the top of the modal.

| Type | Required |
| ---- | -------- |
| node | No       |

### `FooterComponent`

A footer component outside of the ScrollView, at the bottom of the modal.

| Type | Required |
| ---- | -------- |
| node | No       |

### `FloatingComponent`

A floating component inside the modal wrapper that will be independent of scrolling. It requires `zIndex` child with absolute positioning. Check out the [Flatlist example](https://github.com/jeremybarbet/react-native-modalize/blob/master/examples/expo/src/components/modals/FlatList.js#L29-L33).

| Type | Required |
| ---- | -------- |
| node | No       |

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
