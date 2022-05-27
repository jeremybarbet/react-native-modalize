# FAQ

**I'm using a bottom tabs navigation and Modalize is shown behind it?**

- Install a `Portal` package, for example: [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize) to be able to render Modalize on top of everything (it also works for anything else you want)

---

**Swipe gestures are not working on Android, what did I miss?**

You might have forgot to complete [`react-native-gesture-handler`](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html)'s setup steps for Android.

---

**I have an issue with Expo SDK v32, what's happening?**

Expo SDK v32 is using an old version of `react-native-gesture-handler` which has an issue with the gesture event. It makes `Modalize` not working, I recommend you upgrading to SDK v33 that fixed the problem.

---

**Can I make a vertical ScrollView inside the modal?**

First, this is an anti-pattern behavior. You shouldn't have two verticals ScrollView wrapped together. But yes, it's possible. You will have to import the one from `react-native-gesture-handler`.

```tsx
import { ScrollView } from 'react-native-gesture-handler';
```
