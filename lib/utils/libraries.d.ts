/**
 * Before React Native 65, event listeners were taking an `addEventListener` and a `removeEventListener` function.
 * After React Native 65, the `addEventListener` is a subscription that return a remove callback to unsubscribe to the listener.
 * We want to detect which version of React Native we are using to support both way to handle listeners.
 */
export declare const isBelowRN65: boolean;
/**
 * Since RNGH version 2, the `minDist` property is not compatible with `activeOffsetX` and `activeOffsetY`.
 * We check which version of RNGH we are using to support both way to handle `minDist` property.
 */
export declare const isRNGH2: () => boolean;
