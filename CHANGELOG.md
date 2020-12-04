# Changelog

All notable changes to this project will be documented in this file.

## [2.0.8] - 2020-12-04

### 👀 Bug Fixes

- Revert: Position on orientation change
- Revert: If color scheme is "dark", setting modal backgroundColor to black

## [2.0.7] - 2020-12-03

### 👀 Bug Fixes

- Fix disableScrollIfPossible type ([#283](https://github.com/jeremybarbet/react-native-modalize/pull/283)) ([9b8563](https://github.com/jeremybarbet/react-native-modalize/commit/9b8563187b9b6451f5f5bf0adef7676d43017f4d))
- Add missing word at callbacks section ([#272](https://github.com/jeremybarbet/react-native-modalize/commit/5880efc45384bccf254b755915c3d332754755bf)) ([5880ef](https://github.com/jeremybarbet/react-native-modalize/commit/5880efc45384bccf254b755915c3d332754755bf))
- Added devices support for iPhone 12 devices ([#294](https://github.com/jeremybarbet/react-native-modalize/pull/294)) ([e80029](https://github.com/jeremybarbet/react-native-modalize/commit/e80029412931123c8d328261671b94ca055b52c9))
- Position on orientation change ([#274](https://github.com/jeremybarbet/react-native-modalize/pull/274)) ([f0d75a](https://github.com/jeremybarbet/react-native-modalize/commit/f0d75abeafbb1c53842ebc69744d43b993091d89))

### ✨ Improvements

- Allow custom renderer to receive function or react node ([#291](https://github.com/jeremybarbet/react-native-modalize/pull/291)) ([26a4c1](https://github.com/jeremybarbet/react-native-modalize/commit/26a4c141fc729043c9e8b435223afb1ff4012dc1))
- If color scheme is "dark", setting modal backgroundColor to black ([#278](https://github.com/jeremybarbet/react-native-modalize/pull/278)) ([d5ccbb](https://github.com/jeremybarbet/react-native-modalize/commit/d5ccbb1076527b4272b2a64ec42c15b10176d53b))

## [2.0.6] - 2020-08-27

### 👀 Bug Fixes

- Fix adjustToContentHeight on Android ([#219](https://github.com/jeremybarbet/react-native-modalize/issues/219)) ([bebd6e](https://github.com/jeremybarbet/react-native-modalize/commit/bebd6ec2621980b11290ec55cc23f988a264dfdd))

### ✨ Improvements

- Update documentation about installation steps by [@helderburato](https://github.com/helderburato) ([4fcb51](https://github.com/jeremybarbet/react-native-modalize/commit/4fcb51e2df2c4c070852ae6048aa4cc317b1e9f7))
- More documentation about `contentRef` props ([9dd339](https://github.com/jeremybarbet/react-native-modalize/commit/9dd33966dd9b858b3580ded0cb5e21543704a16d))

## [2.0.5] - 2020-07-25

### 👀 Bug Fixes

- Use ref for back button listener by [@archansel](https://github.com/archansel) ([#189](https://github.com/jeremybarbet/react-native-modalize/issues/189)) ([491dfe](https://github.com/jeremybarbet/react-native-modalize/commit/491dfe5f12586dd3bacfa3163c7f863f9c7e6ccb))

### ✨ Improvements

- Exposed IProps as ModalizeProps by [@archansel](https://github.com/archansel) ([#233](https://github.com/jeremybarbet/react-native-modalize/issues/233)) ([b84388](https://github.com/jeremybarbet/react-native-modalize/commit/b843882e2f98d8cb9c95c01b7c6619d7aa0ebbac))

## [2.0.4] - 2020-05-20

### 👀 Bug Fixes

- onPositionChange not correct [#209](https://github.com/jeremybarbet/react-native-modalize/issues/209) ([d9d5aae](https://github.com/jeremybarbet/react-native-modalize/commit/d9d5aaec385131583046fd3dc2334e5cedd21386))

## [2.0.3] - 2020-05-08

### 👀 Bug Fixes

- Allow overwrites on content's core props [#194](https://github.com/jeremybarbet/react-native-modalize/issues/194) ([825fa2](https://github.com/jeremybarbet/react-native-modalize/commit/825fa2b35fa9ccdd606f9b4b3e7941388c77bf05))
- Add listener for height on orientation change by [@LucidNinja](https://github.com/LucidNinja) [#195](https://github.com/jeremybarbet/react-native-modalize/issues/195) ([0bbdae](https://github.com/jeremybarbet/react-native-modalize/commit/0bbdae645e671f5e38a45cd0766e28ba635397d2))

## [2.0.0] - 2020-05-05

### Really happy to release this brand new major version for react-native-modalize.

I have been working on it for the last couple of weeks. Many thanks for the people who contributed, opened PR and found issues. High five to [@xxsnakerxx](https://github.com/xxsnakerxx) for having contributing many times in the last few weeks!

- I rewrote the package using function component, that makes the library lighter, faster and using the latest React practices.
- I also rewrote and reorganize most of the documentation to be easier to read, with way more information about the props, methods, usages and more examples.
- Finally, there was a lot of issues about Modalize not being able to be displayed on top of a bottom tab navigation (e.g. with react-navigation). I released a new package called [`react-native-portalize`](https://github.com/jeremybarbet/react-native-portalize) to be able to solve this issue. It works with Modalize but can also be useful in other context.

### 💣 Breaking change

- The required `ref` to open or close Modalize is still the same `ref={modalizeRef}`, `modalizeRef.current.open()`. However, you won't be able to access `scrollTo`, `scrollToIndex` on the content renderer using this ref anymore. You will need to use the new ref [`contentRef`](/https://jeremybarbet.github.io/react-native-modalize/#/PROPS?id=contentref) that will give you access to the content methods. `contentRef={contentRef}`, `contentRef.current.getScrollResponder().scrollTo(...)`. "content" stands for ScrollView, FlatList or SectionList depending the content renderer you are using.

### 🎉 New features

- Add `panGestureComponentEnabled` and `closeSnapPointStraightEnabled` props ([b831d3](https://github.com/jeremybarbet/react-native-modalize/commit/b831d3dc09c99748832b10a68bdbd7ebb9f7ceee))
- Add `rootStyle` props by [@enniel](https://github.com/enniel) ([149af4](https://github.com/jeremybarbet/react-native-modalize/commit/149af457641fed13069766ff37f17a797083ef6a))
- Add `contentRef` props to access ScrollView/FlatList/SectionList methods by [@xxsnakerxx](https://github.com/xxsnakerxx) ([868870](https://github.com/jeremybarbet/react-native-modalize/commit/868870efec5e6e62dae39682d674a6b37ce6d199))
- Add `childrenStyle` props ([1519e9c](https://github.com/jeremybarbet/react-native-modalize/commit/1519e9c3996063b0e2f12f434379c8268e466738))
- Add `customRendered` props ([0f4e24f](https://github.com/jeremybarbet/react-native-modalize/commit/0f4e24f54a72cea7d6cb56905e3460ce14e8d9fb))
- Add `velocity` props to improve dismiss behavior ([9c6b85a](https://github.com/jeremybarbet/react-native-modalize/commit/9c6b85ae7c78845f5a6f3200a342ace838759541))
- Add `scrollToIndex` props for flatListProps [#125](https://github.com/jeremybarbet/react-native-modalize/issues/125) ([19a3b41](https://github.com/jeremybarbet/react-native-modalize/commit/19a3b413a3c654ebf98a9a0c5cf3886c185934ec))
- Add `threshold` props by [@adrianso](https://github.com/adrianso) ([cf0be59](https://github.com/jeremybarbet/react-native-modalize/commit/cf0be59ad58377f55481a17c4e0ecb705624e37d))
- Add `withOverlay` props by [@marcinolek](https://github.com/marcinolek) ([5aa30f3](https://github.com/jeremybarbet/react-native-modalize/commit/5aa30f36e6b695220fe1ed5e6c9df94620342354))
- Add `FloatingComponent` props by [@vforvasile](https://github.com/vforvasile) ([#162](https://github.com/jeremybarbet/react-native-modalize/issues/162)) ([269934e](https://github.com/jeremybarbet/react-native-modalize/commit/269934e57d1bcaa410128e9ddc3e3fd2d59064f0))
- Add `modalElevation` props for Android [#161](https://github.com/jeremybarbet/react-native-modalize/issues/161) ([0ad5923](https://github.com/jeremybarbet/react-native-modalize/commit/0ad5923bbcf9f0a5813fcde812e1ff56dd5ac21e))
- Add `onLayout` props [#49](https://github.com/jeremybarbet/react-native-modalize/issues/49) ([598d548](https://github.com/jeremybarbet/react-native-modalize/commit/598d548a3cea3fdad805018c954e8e06ec82c9a8))
- Add `onOverlayPress` [#142](https://github.com/jeremybarbet/react-native-modalize/issues/142) ([748c3e7](https://github.com/jeremybarbet/react-native-modalize/commit/748c3e73495d46e61de71b06fa3f5c8abfb0aac3))
- Add `onPositionChange` props ([#122](https://github.com/jeremybarbet/react-native-modalize/issues/122)) ([302a347](https://github.com/jeremybarbet/react-native-modalize/commit/302a34713c20ed38bfe404a49b82c12634354303))
- Add `panGestureAnimatedValue` props from PanGestureHandler ([#113](https://github.com/jeremybarbet/react-native-modalize/issues/113), [#105](https://github.com/jeremybarbet/react-native-modalize/issues/105), [#69](https://github.com/jeremybarbet/react-native-modalize/issues/69)) ([#160](https://github.com/jeremybarbet/react-native-modalize/issues/160)) ([4780d5e](https://github.com/jeremybarbet/react-native-modalize/commit/4780d5e0af3e436c4634d5d6cc92e375691165e5))
- Add `dragToss` props by [@bcpugh](https://github.com/bcpugh) ([eb1b448](https://github.com/jeremybarbet/react-native-modalize/commit/eb1b448d0b876b2f4856a308b7e319dffb32d2b5))
- Add `keyboardAvoidingOffset`, `panGestureEnabled`, `closeOnOverlayTap` and improvements by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#115](https://github.com/jeremybarbet/react-native-modalize/issues/115)) ([7563c82](https://github.com/jeremybarbet/react-native-modalize/commit/7563c827c5ddc3f5bc4cdb78039d53cfa8fdce99))
- New argument to close Modalize and to configure the pointerEvents [#151](https://github.com/jeremybarbet/react-native-modalize/issues/151) ([#152](https://github.com/jeremybarbet/react-native-modalize/issues/152)) ([92db47b](https://github.com/jeremybarbet/react-native-modalize/commit/92db47beff1402ce64ee68dffe399c309b4532bc))
- New argument to open Modalize in full height when using `snapPoint` [#150](https://github.com/jeremybarbet/react-native-modalize/issues/150) ([#153](https://github.com/jeremybarbet/react-native-modalize/issues/153)) ([dfd56fb](https://github.com/jeremybarbet/react-native-modalize/commit/dfd56fb4c6f548979c0002bd6ffddbb07b8c6170))

### ✨ Improvements

- Allow `alwaysOpen` and `ajustToContentHeight` props to work at the same time [#172](https://github.com/jeremybarbet/react-native-modalize/issues/172) ([c37ecd5](https://github.com/jeremybarbet/react-native-modalize/commit/c37ecd52443b3fa90b22d547adae41476ab45204))
- Simplified and fixed `adjustToContentHeight` props by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#166](https://github.com/jeremybarbet/react-native-modalize/issues/166)) ([0c5d908](https://github.com/jeremybarbet/react-native-modalize/commit/0c5d908b5d4c9ffd4fdb292b580d9f369cfac7a1))
- Recalculate when toggle adjustToContentHeight prop ([6fc762d](https://github.com/jeremybarbet/react-native-modalize/commit/6fc762dd242b5f57706d59811d26588952c02e75))
- Basic support for react-native-web ([8d98896](https://github.com/jeremybarbet/react-native-modalize/commit/8d98896834867e781e9fb1e57b328f396bbaa0c1))
- Enable horizontal scrolling for ScrollView by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#121](https://github.com/jeremybarbet/react-native-modalize/issues/121)) ([49ec5ae](https://github.com/jeremybarbet/react-native-modalize/commit/49ec5ae1e8142d691b8e8ada712a3480aa5f1a6e))
- Allow `alwaysOpen` to open to default position ([bed354e](https://github.com/jeremybarbet/react-native-modalize/commit/bed354e9b40ea7b5a64ec5eab2ba3360615dc8bc))
- `scrollTo` methods updated for flatList and sectionList by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#126](https://github.com/jeremybarbet/react-native-modalize/issues/126)) ([038a5ab](https://github.com/jeremybarbet/react-native-modalize/commit/038a5abdc9f444fc5835622415ec0ccd613594ae))

### 👀 Bug Fixes

- Check heights of each Header/Footer/Floating components when used with `ajustToContentHeight` ([#149](https://github.com/jeremybarbet/react-native-modalize/issues/149)) ([7e219c](https://github.com/jeremybarbet/react-native-modalize/commit/7e219c4710f666811a0305793ff09b89e2095569))
- Prevent overlay press closing alwaysOpen by [@jordanl17](https://github.com/jordanl17) ([f0eb9b](https://github.com/jeremybarbet/react-native-modalize/commit/f0eb9b8a7fff4d429657e6985fa815c6118942ce))
- Avoid onScrollBeginDrag overriding default behavior by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#180](https://github.com/jeremybarbet/react-native-modalize/issues/180)) ([14f20cb](https://github.com/jeremybarbet/react-native-modalize/commit/14f20cb800b2f591c58d24707a3e860f7f19b81f))
- Make sure animate is enable when closing modalize ([df49ca5](https://github.com/jeremybarbet/react-native-modalize/commit/df49ca549b25c2d9e8c0913db045a6843796f55d))
  f1cd77a601897b1baadafa12a8fb2f55ccd891cf))
- Translation check for panGesture value ([a46fa43](https://github.com/jeremybarbet/react-native-modalize/commit/a46fa4389237dd02813ed1c594bfc1a52c00824c))
- Cancel translation when ScrollView is not scrolled to the top ([a965fbe](https://github.com/jeremybarbet/react-native-modalize/commit/a965fbe3571f561f07c31490b45704f30e908006))
- Core uses nativeDriver, exposes props for panGestureAnimatedValue only ([19bf709](https://github.com/jeremybarbet/react-native-modalize/commit/19bf709cbefd9fc3712a780f1445414fcc231dfa))
- Flickering while scrolling/panning ([fe267cd](https://github.com/jeremybarbet/react-native-modalize/commit/fe267cd3a4cdedde953aed39fe54ea6badbd6725))
- Pass onLayout if using adjustToContentHeight props ([9b52c0e](https://github.com/jeremybarbet/react-native-modalize/commit/9b52c0e47cec7c6c0aafc3b0e4b7fa1829cc3bb6))
- Rework initial open/close states ([534dc69](https://github.com/jeremybarbet/react-native-modalize/commit/534dc691442fa0f3adf0ad952848a0dc3120f780))
- Take out modalPosition logic out of onPositionChange props check ([a478ef1](https://github.com/jeremybarbet/react-native-modalize/commit/a478ef1bf209d2e4dae1f8a023254444710069a9))
- Hardware back button press handler by [@xxsnakerxx](https://github.com/xxsnakerxx) ([#148](https://github.com/jeremybarbet/react-native-modalize/issues/148)) ([7e1cbf0](https://github.com/jeremybarbet/react-native-modalize/commit/7e1cbf01adf27ebfcdf658ffa0dfb319c29672ed))
- Only trigger positive values ([6e19ee8](https://github.com/jeremybarbet/react-native-modalize/commit/6e19ee8be7d8b8b89d9168a3de7dfad0f75c66d8))
- Remove back press listener on unmount by [@Grohden](https://github.com/jeremybarbet/react-native-modalize/commits?author=Grohden) ([#137](https://github.com/jeremybarbet/react-native-modalize/issues/137)) ([eafb8ee](https://github.com/jeremybarbet/react-native-modalize/commit/eafb8ee59526f58c96beb8e4aae1cf6959c5c0f0)), closes [#111](https://github.com/jeremybarbet/react-native-modalize/issues/111)
- Enable scroll when keyboard is toggle ([c7a7dbe](https://github.com/jeremybarbet/react-native-modalize/commit/c7a7dbef68ffcffb2e7840b7b7ff3dbb5dc4f93f))
- Make sure we don't enable scroll by mistake ([716f5ab](https://github.com/jeremybarbet/react-native-modalize/commit/716f5ab8ae3fe6afc3477095b91ae45da045b285))
- Avoid events to be trigger twice ([#130](https://github.com/jeremybarbet/react-native-modalize/issues/130)) ([9413350](https://github.com/jeremybarbet/react-native-modalize/commit/94133503149591b92dae6525b8a6eaaad3d205f3))
- Disable scroll when using `adjustToContentHeight` ([5550f3f](https://github.com/jeremybarbet/react-native-modalize/commit/5550f3f5621cf386e7f25afd5bfdb7e198cf54ed))
- Disable scroll with `alwaysOpen` props on init ([990cba7](https://github.com/jeremybarbet/react-native-modalize/commit/990cba78c57a0c1cad731a96904c7bcc3c4b0204))
- And many more...

## [1.3.6] - 2019-12-28

### Changed

- Use timing function onAnimateClose

## [1.3.5] - 2019-12-27

### Changed

- Revert bouncing translate

## [1.3.4] - 2019-12-26

### Changed

- Better spring/timing props
- Mask for empty space with bounce

## [1.3.3] - 2019-12-20

### Changed

- Fix bouncing on opening animation
- Clean examples from unused functions

## [1.3.2] - 2019-12-20

### Added

- New argument to the `close` method to reset to initial position `alwaysOpen` modal (`close('alwaysOpen')`)

### Changed

- Fix glitchy issue `onAnimateOpen` cause by `extrapolate: clamp` and `spring` animation

## [1.3.1] - 2019-12-19

### Changed

- Remove uppercase from `options.ts` file

## [1.3.0] - 2019-12-19

### Added

- Dev tools (prettier, commitlint)

### Changed

- _BREAKING_ Move to name import (before) `import Modalize from 'react-native-modalize'` -> (after) `import { Modalize } from 'react-native-modalize'`
- Fix overlay press to dismiss by [@Esirei](https://github.com/Esirei)
- Fix initial state when using `alwaysOpen` by [@benjaminreid](https://github.com/benjaminreid)
- Change renovate to keep all changes in same PR
- Update packages
- Update examples
- Rename source files

## [1.2.2] - 2019-10-13

### Changed

- Fix flickering issue with adjustToContentHeight by [@charpeni](https://github.com/charpeni)
- Add renovate to keep packages up-to-date
- Upgrade dependencies

## [1.2.1] - 2019-08-02

### Changed

- Fix issue with hasAbsoluteStyle util
- Fix flickering on swipe gesture
- Update documentation
- Add changelog file

## [1.2.0] - 2019-07-31

### Added

- `openAnimationConfig` / `closeAnimationConfig` to control the animations by [@WrathChaos](https://github.com/WrathChaos).
- `modalHeight` to set a specific height to the modal by [@WrathChaos](https://github.com/WrathChaos).

### Changed

- _BREAKING_ `style` props renamed to `modalStyle`
- _BREAKING_ `height` props renamed to `snapPoint`
- Create utils file to make internal source lighter

## [1.1.1] - 2019-06-21

### Added

- More gif examples for all behaviors possible

### Changed

- Move hardwareBackPress to open and close animation functions

## [1.1.0] - 2019-06-20

### Added

- Add `alwaysOpen` props, to keep the modal always open on the bottom of the screen
- Bump `js-yaml` package because of security warning

## [1.0.0] - 2019-06-06

### Changed

- Improve documentation
- Refactor all examples, and make it easier to use them
- Move examples from React.class to stateless function
- Null check on component passed to Modalize
- Bump packages from source code and examples
