import { useCallback, useRef } from 'react';

import { Close, ModalizeMethods, Open } from '../options';

export const useModalize = () => {
  const ref = useRef<ModalizeMethods>(null);

  const close = useCallback((dest?: Close) => {
    ref.current?.close(dest);
  }, []);

  const open = useCallback((dest?: Open) => {
    ref.current?.open(dest);
  }, []);

  return { ref, open, close };
};
