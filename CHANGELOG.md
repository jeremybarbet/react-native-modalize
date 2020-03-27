# Changelog

All notable changes to this project will be documented in this file.

## [1.3.7] - not release yet

### Bug Fixes

- reverse to put default as default :D ([4f004d2](https://github.com/jeremybarbet/react-native-modalize/commit/4f004d29ed23f270cb09e86b1ce6008417ff4150))
- add missing props to the docs ([88f86cc](https://github.com/jeremybarbet/react-native-modalize/commit/88f86ccaa031b8804382b5f72972332dd6b6eb2f))
- add docs ([7ec0bb2](https://github.com/jeremybarbet/react-native-modalize/commit/7ec0bb26884a5a0e3e24f06ca70d68426204e743))
- rework initial open/close states ([534dc69](https://github.com/jeremybarbet/react-native-modalize/commit/534dc691442fa0f3adf0ad952848a0dc3120f780))
- take out modalPosition logic out of onPositionChange props check ([a478ef1](https://github.com/jeremybarbet/react-native-modalize/commit/a478ef1bf209d2e4dae1f8a023254444710069a9))
- take props from the function directly ([9680403](https://github.com/jeremybarbet/react-native-modalize/commit/96804030cef484a61648cb142212e0d4ef6690be))
- hardware back button press handler ([#148](https://github.com/jeremybarbet/react-native-modalize/issues/148)) ([7e1cbf0](https://github.com/jeremybarbet/react-native-modalize/commit/7e1cbf01adf27ebfcdf658ffa0dfb319c29672ed))
- only trigger positive values ([6e19ee8](https://github.com/jeremybarbet/react-native-modalize/commit/6e19ee8be7d8b8b89d9168a3de7dfad0f75c66d8))
- remove back press listener on unmount ([#137](https://github.com/jeremybarbet/react-native-modalize/issues/137)) ([eafb8ee](https://github.com/jeremybarbet/react-native-modalize/commit/eafb8ee59526f58c96beb8e4aae1cf6959c5c0f0)), closes [#111](https://github.com/jeremybarbet/react-native-modalize/issues/111)
- enable scroll when keyboard is toggle ([c7a7dbe](https://github.com/jeremybarbet/react-native-modalize/commit/c7a7dbef68ffcffb2e7840b7b7ff3dbb5dc4f93f))
- make sure we don't enable scroll by mistake ([716f5ab](https://github.com/jeremybarbet/react-native-modalize/commit/716f5ab8ae3fe6afc3477095b91ae45da045b285))
- avoid events to be trigger twice ([#130](https://github.com/jeremybarbet/react-native-modalize/issues/130)) ([9413350](https://github.com/jeremybarbet/react-native-modalize/commit/94133503149591b92dae6525b8a6eaaad3d205f3))
- disable scroll when using adjustToContentHeight ([5550f3f](https://github.com/jeremybarbet/react-native-modalize/commit/5550f3f5621cf386e7f25afd5bfdb7e198cf54ed))
- disable scroll with alwaysOpen props on init ([990cba7](https://github.com/jeremybarbet/react-native-modalize/commit/990cba78c57a0c1cad731a96904c7bcc3c4b0204))
- flash drag panHandler ([faa670c](https://github.com/jeremybarbet/react-native-modalize/commit/faa670c00808a9aab9b35269af46ccdb3c439b0b))
- pan gesture enabled on ios too ([5fb661f](https://github.com/jeremybarbet/react-native-modalize/commit/5fb661f88118c66768d17531dcf600cc5fd319a9))
- added-typescript-definition ([eb1b448](https://github.com/jeremybarbet/react-native-modalize/commit/eb1b448d0b876b2f4856a308b7e319dffb32d2b5))
- format docs ([#131](https://github.com/jeremybarbet/react-native-modalize/issues/131)) ([f7e53cc](https://github.com/jeremybarbet/react-native-modalize/commit/f7e53cc29db2df3a02e1c9d89d99881f3e13d7fa))
- minor changes ([5801692](https://github.com/jeremybarbet/react-native-modalize/commit/5801692fa1ed940d9d97234b1c3d8ccb7c95d97b))
- scrollto method for flatlist and sectionlist ([#126](https://github.com/jeremybarbet/react-native-modalize/issues/126)) ([038a5ab](https://github.com/jeremybarbet/react-native-modalize/commit/038a5abdc9f444fc5835622415ec0ccd613594ae))
- typo/clean ([447352f](https://github.com/jeremybarbet/react-native-modalize/commit/447352f0493033c4ffcd6d7aafc412910174ed21))
- with animated typing for childrens ([cb13b06](https://github.com/jeremybarbet/react-native-modalize/commit/cb13b06ee07c4e7a5b3cdf45c1e7996283eba115))
- minor changes ([6a02268](https://github.com/jeremybarbet/react-native-modalize/commit/6a022681d7cfabd40bf12a8b6cb5cc18910dc0eb))

### Features

- basic support to avoid react-native-web crash ([8d98896](https://github.com/jeremybarbet/react-native-modalize/commit/8d98896834867e781e9fb1e57b328f396bbaa0c1))
- allow open alwaysOpen modal to default position ([bed354e](https://github.com/jeremybarbet/react-native-modalize/commit/bed354e9b40ea7b5a64ec5eab2ba3360615dc8bc))
- add prop to open full with snap state [#150](https://github.com/jeremybarbet/react-native-modalize/issues/150) ([#153](https://github.com/jeremybarbet/react-native-modalize/issues/153)) ([dfd56fb](https://github.com/jeremybarbet/react-native-modalize/commit/dfd56fb4c6f548979c0002bd6ffddbb07b8c6170))
- added param to close overlay and condition to pointerEvents [#151](https://github.com/jeremybarbet/react-native-modalize/issues/151) ([#152](https://github.com/jeremybarbet/react-native-modalize/issues/152)) ([92db47b](https://github.com/jeremybarbet/react-native-modalize/commit/92db47beff1402ce64ee68dffe399c309b4532bc))
- add onLayout props [#49](https://github.com/jeremybarbet/react-native-modalize/issues/49) ([598d548](https://github.com/jeremybarbet/react-native-modalize/commit/598d548a3cea3fdad805018c954e8e06ec82c9a8))
- add onOverlayPress [#142](https://github.com/jeremybarbet/react-native-modalize/issues/142) ([748c3e7](https://github.com/jeremybarbet/react-native-modalize/commit/748c3e73495d46e61de71b06fa3f5c8abfb0aac3))
- add onPositionChange props ([#122](https://github.com/jeremybarbet/react-native-modalize/issues/122)) ([302a347](https://github.com/jeremybarbet/react-native-modalize/commit/302a34713c20ed38bfe404a49b82c12634354303))
- enable horizontal scrolling of ScrollView from RN ([#121](https://github.com/jeremybarbet/react-native-modalize/issues/121)) ([49ec5ae](https://github.com/jeremybarbet/react-native-modalize/commit/49ec5ae1e8142d691b8e8ada712a3480aa5f1a6e))
- improvements, fixes and new props ([#115](https://github.com/jeremybarbet/react-native-modalize/issues/115)) ([7563c82](https://github.com/jeremybarbet/react-native-modalize/commit/7563c827c5ddc3f5bc4cdb78039d53cfa8fdce99))

### Reverts

- Revert "fix: flash drag panHandler" ([a505648](https://github.com/jeremybarbet/react-native-modalize/commit/a505648965fa7f969abce88dfcfc1ae4ff949ce1))

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
