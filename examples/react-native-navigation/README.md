# :space_invader: React Native Template TypeScript · [![Build Status](https://travis-ci.org/emin93/react-native-template-typescript.svg?branch=master)](https://travis-ci.org/emin93/react-native-template-typescript)

Clean and minimalist React Native template for a quick start with TypeScript.

[![Header](https://cdn-images-1.medium.com/max/500/1*E9RnPOATuhjuNrlFkv5oSg.jpeg)](https://medium.com/@emin93/react-native-typescript-b965059109d3)

## :star: Features

- Seamlessly integrated into the React Native CLI! :sparkles:
- Consistent with the default React Native template
- Always latest dependencies :raised_hands:

## :arrow_forward: Quick Start

```bash
react-native init MyApp --template typescript && node MyApp/setup.js
```

## :question: FAQ

### Why this template when React Native 0.57+ supports TypeScript out of the box?

First of all, I started this template before React Native 0.57 came out. After React Native 0.57 was announced, I planned to stop maintenance on this template. But after further evaluation, there's still some manual work to do (add type definitions for React & React Native, create a `.tsconfig` for type checking, etc.) to properly set up a React Native 0.57+ TypeScript project. And that's where this template comes in and does that work for you. :raised_hands:

### What additional dependencies are included in this template?

- [TypeScript](https://github.com/Microsoft/TypeScript)
- [Type definitions for React & React Native](https://github.com/DefinitelyTyped/DefinitelyTyped)

This template always uses the latest versions of the dependencies at the time when the `react-native init` command is being executed. This means you don't have to worry about old versions.

Lots of :heart: and credits to the owners and maintainers of those packages.

### Why the setup script?

It deletes obsolete files like the `.flowconfig` and the `setup.js` itself after the setup.

### How to do type checking?

`npm run tsc`

### Does debugging work?

Yes it does.

[![Demonstration of working breakpoints in Visual Studio Code](https://cdn-images-1.medium.com/max/1600/1*ZXfzgq1xKz1B3chYy9xE7w.png)](https://medium.com/@emin93/react-native-typescript-b965059109d3)

## :globe_with_meridians: Links

- ["Using React Native with TypeScript just became simple" on Medium](https://medium.com/@emin93/react-native-typescript-b965059109d3)
- ["24 tips for React Native you probably want to know" on Albert Gao's blog](http://albertgao.xyz/2018/05/30/24-tips-for-react-native-you-probably-want-to-know/#9-For-Typescript)

## :computer: Contributing

Contributions are very welcome. Please check out the [contributing document](https://github.com/emin93/react-native-template-typescript/blob/master/CONTRIBUTING.md).

### Donations

I created this project in my spare time because I enjoy coding. Of course you can support me by [buying me a coffee](https://www.paypal.me/emin93) if you wish. :coffee: :relieved:
