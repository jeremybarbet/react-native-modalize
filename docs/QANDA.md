# Q&A

**Can I make a horizontal ScrollView inside the modal?**

Yes, of course you can. But if you use the one from `react-native` it won't work. You will have to import the one from `react-native-gesture-handler`.

```jsx
import { ScrollView } from 'react-native-gesture-handler';
```

**What's the React modal's warning?**

In a future version of `react-native`, the `Modal` component will be moved out from the core. Check [this page](/EXAMPLES.md) to get more details.

**Can we have more transition and options to customize Modalize?**

This component is very opinionated. I want it first to solves to three most complicated issues of swipping/scrolling and handling a keyboard within the Modal before adding this kind of feature.

**I have issue with Expo SDK v32, what's happening?**

Expo SDK v32 is using an old version of `react-native-gesture-handler` which has an issue with the gesture event. It makes `Modalize` not working, I recommend you upgrading to SDK v33 that fixed the problem.
