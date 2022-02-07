import * as React from 'react';

import { Modalize } from '../index';
import { Close, Open } from '../options';

export const useModalize = () => {
  const ref = React.useRef<Modalize>(null);

  const close = React.useCallback((dest?: Close) => {
    ref.current?.close(dest);
  }, []);

  const open = React.useCallback((dest?: Open) => {
    ref.current?.open(dest);
  }, []);

  return { ref, open, close };
};
