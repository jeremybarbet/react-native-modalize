"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeb = exports.isAndroid = exports.isIphoneX = exports.isIos = void 0;
const react_native_1 = require("react-native");
const { width, height } = react_native_1.Dimensions.get('window');
exports.isIos = react_native_1.Platform.OS === 'ios';
exports.isIphoneX = exports.isIos &&
    (height === 780 ||
        width === 780 ||
        height === 812 ||
        width === 812 ||
        height === 844 ||
        width === 844 ||
        height === 896 ||
        width === 896 ||
        height === 926 ||
        width === 926);
exports.isAndroid = react_native_1.Platform.OS === 'android';
exports.isWeb = react_native_1.Platform.OS === 'web';
