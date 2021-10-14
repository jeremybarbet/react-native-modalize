import * as React from 'react';

import { Modalize } from '../index';
import { TClose, TOpen } from '../options';

export const useModalize = () => {
  const ref = React.useRef<Modalize>(null);

  const close = React.useCallback((dest?: TClose) => {
    ref.current?.close(dest);
  }, []);

  const open = React.useCallback((dest?: TOpen) => {
    ref.current?.open(dest);
  }, []);

  return { ref, open, close };
};
