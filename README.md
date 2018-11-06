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

## The Props's army

| Props                  | Type        | Default         | Description                                                      |
| ---------------------- | ----------- | --------------- | ---------------------------------------------------------------- |
| children               | node        | **`required`**  | Something nice inside the modal (or not, up to you)              |
| swiperPosition         | string      | `outside`       | The swiper's position on top of the modal, because it's nice     |
| height                 | number      | `null`          | If you want the enable the snapping feature, add this props      |
| style                  | style       | `null`          | You want a better design to this white background, pass it here  |
| onOpen                 | func        | `null`          | Called when the open method is used                              |
| onOpened               | func        | `null`          | Called when the opening animation is finished                    |
| onClose                | func        | `null`          | Called when the close method is used                             |
| onClosed               | func        | `null`          | Called when the closing animation is finished                    |
| useNativeDriver        | boolean     | `true`          | Because it's better to use native animations                     |
| adjustToContentHeight  | boolean     | `false`         | Don't want to calculate the height, just use this props          |
| HeaderComponent        | node        | `null`          | A fixed header component on top of the modal                     |
| FooterComponent        | node        | `null`          | A fixed footer component on top of the modal                     |
