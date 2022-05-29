import React, { forwardRef } from 'react';

import { Modalize as Base } from './components/Modalize';
import { InternalLogicProvider } from './contexts/InternalLogicProvider';
import { InternalPropsProvider } from './contexts/InternalPropsProvider';
import { Handles, Props } from './options';

export const Modalize = forwardRef<Handles, Props>(({ ...props }, ref) => (
  <InternalPropsProvider {...props}>
    <InternalLogicProvider>
      <Base ref={ref} {...props} />
    </InternalLogicProvider>
  </InternalPropsProvider>
));

export type Modalize = Handles;
