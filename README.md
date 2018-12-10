# Modalize

[![npm version](https://badge.fury.io/js/react-native-modalize.svg)](https://badge.fury.io/js/react-native-modalize)

**This package is still in an early stage, use it with caution.** 🖖

A modal that loves ScrollViews. This component had been built with `react-native-gesture-handler` to address the common issue of scrolling and swipping behaviors you can face with a modal with react-native. This component is built-in with a `ScrollView`, you don't have to include it by yourself, just pass a View with your content, and the component will handle the rest for you.

## Demo

An expo app is avalaible at the [following link](https://expo.io/@jeremdsgn/react-native-modalize).

<p align="left">
  <img src="https://user-images.githubusercontent.com/937328/48359862-ca19bc80-e695-11e8-9e66-6ed182f3dd87.gif" height="532" />
  <img src="https://user-images.githubusercontent.com/937328/48358611-07307f80-e693-11e8-852d-a14200005b30.gif" height="532" />
  <img src="https://user-images.githubusercontent.com/937328/48358629-0dbef700-e693-11e8-8281-f86e280db7ac.gif" height="531" />
</p>

## Installation

```bash
yarn add react-native-modalize
```

This package has a peer dependency to `react-native-gesture-handler`, follow [their guide](https://kmagiera.github.io/react-native-gesture-handler/docs/getting-started.html) to set it up on your project.

```bash
"peerDependencies": {
  "react-native-gesture-handler": ">=1.0.7"
}
```

## Features

- Scrollable behavior
- Snapping states
- In and out animations
- Swiping events
- Open and close exposed methods
- Listeners (onOpen/onOpened/onClose/onClosed)
- Use native driver by default
- Take care of keyboard if you have inputs

## Usage

1. Import Modalize

```jsx
import Modalize from 'react-native-modalize';
```

2. Add the modal in your render function, and use the `open` method to open the modal

```jsx
export default class MyApp extends React.PureComponent {

  modal = React.createRef();

  onOpen = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  render () {
    return (
      <View>
        <TouchableOpacity onPress={this.onOpen}>
          <Text>Open the modal</Text>
        </TouchableOpacity>

        <Modalize ref={this.modal}>
          ...your content
        </Modalize>
      </View>
    )
  }
}
```

## Props

| Name                            | Type        | Default         | Description                                       |
| ------------------------------- | ----------- | --------------- | ------------------------------------------------- |
| `children`                      | node        | **`required`**  | Something nice inside (or not, up to you)         |
| `style`                         | style       |                 | Style passed to the container                     |
| `handlePosition`                | string      | `outside`       | The handle's position on top of the modal         |
| `handleStyle`                   | style       |                 | Style passed to the handle                        |
| `overlayStyle`                  | style       |                 | Style passed to the overlay                       |
| `useNativeDriver`               | bool        | `true`          | Because it's better to use the UI thread          |
| `height`                        | number      |                 | A first snap value before snapping to full height |
| `adjustToContentHeight`         | bool        | `false`         | Shrink the modal to content's height              |
| `showsVerticalScrollIndicator`  | bool        | `false`         | Do not show the indicator for the scrollview      |
| `withReactModal`                | bool        | `false`         | To use React Modal to wrap modalize Only iOS      |
| `withHandle`                    | bool        | `true`          | To hide the handle if you don't want it           |
| `HeaderComponent`               | node        |                 | A fixed header component on top of the modal      |
| `FooterComponent`               | node        |                 | A fixed footer component on top of the modal      |
| `onOpen`                        | func        |                 | Called when the `open` method is used             |
| `onOpened`                      | func        |                 | Called when the modal is opened                   |
| `onClose`                       | func        |                 | Called when the `close` method is used            |
| `onClosed`                      | func        |                 | Called when the modal is closed                   |

## Methods

| Name                            | Type        | Default         | Description                                       |
| ------------------------------- | ----------- | --------------- | ------------------------------------------------- |
| `open`                          | func        | **`required`**  | The method to open the modal                      |
| `close`                         | func        |                 | The method to close the modal                     |

## Q&A

**Can I make a horizontal ScrollView inside the modal?**

Yes, of course you can. But if you use the one from `react-native` it won't work. You will have to import the one from `react-native-gesture-handler`.

```tsx
import { ScrollView } from 'react-native-gesture-handler'`;
```

**What's the React modal's warning?**

In a future version of `react-native`, the `Modal` component will be moved out from the core. Besides, `react-native-gesture-handler` for `Android` doesn't work well with it. I'd recommend migrating to something like react-navigation or react-native-navigation's modal to wrap this component.

## Development

It's pretty rough for now, but it works.

```bash
cd example/
yarn
yarn start
```

Change the code into `example/node_modules/react-native-modalize/*.ts(x)`. Then the magic happens, copy your code changed and go to `src/*.ts(x)` and paste it. You can now commit and open a pull request.
