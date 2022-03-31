"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDimensions = void 0;
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const libraries_1 = require("./libraries");
exports.useDimensions = () => {
    const [dimensions, setDimensions] = React.useState(react_native_1.Dimensions.get('window'));
    const onChange = ({ window }) => {
        setDimensions(window);
    };
    React.useEffect(() => {
        let dimensionChangeListener = null;
        if (libraries_1.isBelowRN65) {
            react_native_1.Dimensions.addEventListener('change', onChange);
        }
        else {
            dimensionChangeListener = react_native_1.Dimensions.addEventListener('change', onChange);
        }
        return () => {
            if (libraries_1.isBelowRN65) {
                react_native_1.Dimensions.removeEventListener('change', onChange);
            }
            else {
                dimensionChangeListener === null || dimensionChangeListener === void 0 ? void 0 : dimensionChangeListener.remove();
            }
        };
    }, []);
    return dimensions;
};
