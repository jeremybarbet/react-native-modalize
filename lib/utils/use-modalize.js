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
exports.useModalize = void 0;
const React = __importStar(require("react"));
exports.useModalize = () => {
    const ref = React.useRef(null);
    const close = React.useCallback((dest) => {
        var _a;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.close(dest);
    }, []);
    const open = React.useCallback((dest) => {
        var _a;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.open(dest);
    }, []);
    return { ref, open, close };
};
