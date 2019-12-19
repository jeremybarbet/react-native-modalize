# Changelog

All notable changes to this project will be documented in this file.

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

[unreleased]: https://github.com/jeremybarbet/react-native-modalize/compare/1.3.1...HEAD

## [1.0.0] - 2019-06-06

### Changed

- Improve documentation
- Refactor all examples, and make it easier to use them
- Move examples from React.class to stateless function
- Null check on component passed to Modalize
- Bump packages from source code and examples
