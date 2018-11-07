# Modalize

A modal that loves ScrollViews. This component had been built with `react-native-gesture-handler` on top of the `Modal` component. It's made to address the common issue of the scrollable behavior you can face with react-native.

## Installation

```bash
yarn add react-native-modalize
```

This package has a peer dependencies to `react-native-gesture-handler`, follow [their guide](https://kmagiera.github.io/react-native-gesture-handler/docs/getting-started.html) to set it up on your project.

```bash
"peerDependencies": {
  "react-native-gesture-handler": ">=1.0.7"
}
```

## Features

- Scrollable behavior by default
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
import Modalize from 'react-native-modal';
```

2. Add the modal in your render function, and use the `open` / `close` public methods

```jsx
export default class MyApp extends React.Component {

  modal = React.createRef();

  onOpen = () => {
    if (this.modal.current) {
      this.modal.current.open();
    }
  }

  onClose = () => {
    if (this.modal.current) {
      this.modal.current.close();
    }
  }

  render () {
    return (
      <View>
        <TouchableOpacity onPress={this.onOpen}>
          <Text>Open the modal</Text>
        </TouchableOpacity>

        <Modalize ref={this.modal}>
          <View style={{ padding: 10 }}>
            <Text>The content and it will be scrollable if tall enough!</Text>

            <TouchableOpacity onPress={this.onClose}>
              <Text>Close the modal</Text>
            </TouchableOpacity>
          </View>
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
| `useNativeDriver`               | bool        | `true`          | Because it's better to use the UI thread          |
| `height`                        | number      |                 | A first snap value before snaping to full height  |
| `adjustToContentHeight`         | bool        | `false`         | Shrink the modal to content's height              |
| `showsVerticalScrollIndicator`  | bool        | `false`         | Do not show the indicator for the scrollview      |
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

## Development

It's pretty rough for now, but it works.

```bash
cd example/
yarn
yarn start
```

Change the code into `example/node_modules/react-native-modalize/*.ts(x)`. Then the magic happen, copy your code changed and go to `src/*.ts(x)` and paste it. You can now commit and open a pull request.
