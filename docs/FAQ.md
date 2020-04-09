# FAQ

**Swipe gestures are not working on Android, what did I miss?**

If you are running an old version of Modalize `< 1.3.7-rc.18`, you might need to follow [`react-native-gesture-handler's guide`](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html) to complete the native setup on Android. In the latest versions of Modalize, the library is wrapped with `GestureHandlerRootView`, so you don't have to do it manually on your own.

****

**Can I use `withReactModal` props?**

For a long time, using Modalize along with `react-native`'s `Modal` component wasn't working on Android because of an issue. In a recent release of [`react-native-gesture-handler`](https://github.com/software-mansion/react-native-gesture-handler/pull/937) it has now been fixed. You will need at least `react-native-gesture-handler >= 1.6.0` in order to work.

****

**I have an issue with Expo SDK v32, what's happening?**

Expo SDK v32 is using an old version of `react-native-gesture-handler` which has an issue with the gesture event. It makes `Modalize` not working, I recommend you upgrading to SDK v33 that fixed the problem.

****

**Can I make a vertical ScrollView inside the modal?**

First, this is an anti-pattern behavior. You shouldn't have two verticals scrollview wrapped together. But yes, it's possible. You will have to import the one from `react-native-gesture-handler`.

```tsx
import { ScrollView } from 'react-native-gesture-handler';
```
