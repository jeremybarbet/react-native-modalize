import { ForwardedRef, MutableRefObject, useEffect, useRef } from 'react';

export const useCombinedRefs = <T = any>(
  ...refs: (MutableRefObject<any> | ForwardedRef<any>)[]
) => {
  const targetRef = useRef<T>();

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef as MutableRefObject<T>;
};
