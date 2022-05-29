import React, { forwardRef } from 'react';

import { Modalize as Base } from './components/Modalize';
import { InternalPropsProvider } from './contexts/internalPropsProvider';
import { Handles, Props } from './options';

export const Modalize = forwardRef<Handles, Props>(({ ...props }, ref) => (
  <InternalPropsProvider {...props}>
    <Base ref={ref} {...props} />
  </InternalPropsProvider>
));

export type Modalize = Handles;
