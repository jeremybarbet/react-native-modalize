/**
 * Extracted from https://github.com/seznam/compose-react-refs
 * and moved here to avoid to install an extra-dependency
 */
import * as React from 'react';

type NonNullRef<T> = NonNullable<React.Ref<T>>;
const composedRefCache = new WeakMap<
  NonNullRef<unknown>,
  WeakMap<NonNullRef<unknown>, NonNullRef<unknown>>
>();

export const composeRefs = <T>(
  ref1: React.Ref<T>,
  ref2: React.Ref<T> | undefined,
): React.Ref<T> => {
  if (ref1 && ref2) {
    const ref1Cache =
      composedRefCache.get(ref1) || new WeakMap<NonNullRef<unknown>, NonNullRef<unknown>>();
    composedRefCache.set(ref1, ref1Cache);

    const composedRef =
      ref1Cache.get(ref2) ||
      ((instance: T): void => {
        updateRef(ref1, instance);
        updateRef(ref2, instance);
      });
    ref1Cache.set(ref2, composedRef);

    return composedRef as NonNullRef<T>;
  }

  return ref1;
};

const updateRef = <T>(ref: NonNullRef<T>, instance: null | T): void => {
  if (typeof ref === 'function') {
    ref(instance);
  } else {
    (ref as React.MutableRefObject<T | null>).current = instance;
  }
};
