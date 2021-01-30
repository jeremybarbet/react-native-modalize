import { useCallback, useRef } from 'react';
import { Modalize } from '../index';
import { TClose, TOpen } from '../options';

export const useModalize = () => {
  const ref = useRef<Modalize>(null);

  const close = useCallback((dest?: TClose) => {
    ref.current?.close(dest);
  }, []);

  const open = useCallback((dest?: TOpen) => ref.current?.open(dest), []);

  return { ref, open, close };
};
