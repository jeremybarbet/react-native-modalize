# Q&A

**Can I make a horizontal ScrollView inside the modal?**

Yes, of course you can. But if you use the one from `react-native` it won't work. You will have to import the one from `react-native-gesture-handler`.

```jsx
import { ScrollView } from 'react-native-gesture-handler';
```

**What's the React modal's warning?**

In a future version of `react-native`, the `Modal` component will be moved out from the core. Check [this page](/EXAMPLES.md) to get more details.

**Can we have more transition and options to customize Modalize?**

This component is very opinionated. I want it first to solves to three most complicated issues of swipping/scrolling and handling a keyboard within the Modal.
