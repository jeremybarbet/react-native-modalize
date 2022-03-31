/**
 * Extracted from https://github.com/seznam/compose-react-refs
 * and moved here to avoid to install an extra-dependency
 */
import * as React from 'react';
export declare const composeRefs: <T>(ref1: React.Ref<T>, ref2: ((instance: T | null) => void) | React.RefObject<T> | null | undefined) => React.Ref<T>;
