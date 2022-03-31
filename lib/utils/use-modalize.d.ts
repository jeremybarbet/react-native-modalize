import * as React from 'react';
export declare const useModalize: () => {
    ref: React.RefObject<import("../options").IHandles>;
    open: (dest?: "top" | "default" | undefined) => void;
    close: (dest?: "default" | "alwaysOpen" | undefined) => void;
};
