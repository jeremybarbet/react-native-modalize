import { useCallback, useRef } from 'react';

import { Modalize } from '../index';
import { Close, Open } from '../options';

export const useModalize = () => {
  const ref = useRef<Modalize | null>(null);

  const close = useCallback((dest?: Close) => {
    ref.current?.close(dest);
  }, []);

  const open = useCallback((dest?: Open) => {
    ref.current?.open(dest);
  }, []);

  return { ref, open, close };
};
