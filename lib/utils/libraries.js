"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRNGH2 = exports.isBelowRN65 = void 0;
const react_native_1 = require("react-native");
/**
 * Before React Native 65, event listeners were taking an `addEventListener` and a `removeEventListener` function.
 * After React Native 65, the `addEventListener` is a subscription that return a remove callback to unsubscribe to the listener.
 * We want to detect which version of React Native we are using to support both way to handle listeners.
 */
exports.isBelowRN65 = ((_b = (_a = react_native_1.Platform.constants) === null || _a === void 0 ? void 0 : _a.reactNativeVersion) === null || _b === void 0 ? void 0 : _b.minor) < 65;
/**
 * Since RNGH version 2, the `minDist` property is not compatible with `activeOffsetX` and `activeOffsetY`.
 * We check which version of RNGH we are using to support both way to handle `minDist` property.
 */
exports.isRNGH2 = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { version } = require('react-native-gesture-handler/package.json');
    return parseInt(version, 10) >= 2;
};
