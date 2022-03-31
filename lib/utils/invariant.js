"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = void 0;
const genericMessage = 'Invariant Violation "react-native-modalize"';
const { setPrototypeOf = (obj, proto) => {
    obj.__proto__ = proto;
    return obj;
}, } = Object;
class InvariantError extends Error {
    constructor(message = genericMessage) {
        super(`${message}`);
        this.framesToPop = 1;
        this.name = genericMessage;
        setPrototypeOf(this, InvariantError.prototype);
    }
}
exports.invariant = (condition, message) => {
    if (condition) {
        throw new InvariantError(message);
    }
};
