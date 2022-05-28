// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

declare module 'react' {
  function forwardRef<T, P = Record<string, unknown>>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null,
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}
