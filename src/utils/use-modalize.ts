import { useCallback, useRef } from 'react';
import { Modalize } from '../index';

export const useModalize = () => {
  const ref = useRef<Modalize>(null);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  const open = useCallback(() => ref.current?.open(), []);

  return { ref, open, close };
};
