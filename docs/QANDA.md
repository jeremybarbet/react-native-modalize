# Q&A

**Can I make a horizontal ScrollView inside the modal?**

Yes, of course you can. But if you use the one from `react-native` it won't work. You will have to import the one from `react-native-gesture-handler`.

```jsx
import { ScrollView } from 'react-native-gesture-handler';
```

**What's the React modal's warning?**

In a future version of `react-native`, the `Modal` component will be moved out from the core. Besides, `react-native-gesture-handler` for `Android` doesn't work well with it. I'd recommend migrating to something like react-navigation or react-native-navigation's modal to wrap this component.
