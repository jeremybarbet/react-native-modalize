import React, { forwardRef } from 'react';

import { Root } from './components/Root';
import { InternalProvider } from './context/InternalProvider';
import { PropsProvider } from './context/PropsProvider';
import { invariant } from './utils/invariant';
import { ModalizeMethods, ModalizeProps } from './options';

export const Modalize = forwardRef<ModalizeMethods, ModalizeProps>((props, ref) => {
  invariant(
    props?.modalHeight && props.adjustToContentHeight,
    `You can't use both 'modalHeight' and 'adjustToContentHeight' props at the same time. Only choose one of the two.`,
  );

  invariant(
    (props.scrollViewProps || props.children) && props.flatListProps,
    `You have defined 'flatListProps' along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'flatListProps' to fix the error.`,
  );

  invariant(
    (props.scrollViewProps || props.children) && props.sectionListProps,
    `You have defined 'sectionListProps' along with 'scrollViewProps' or 'children' props. Remove 'scrollViewProps' or 'children' or 'sectionListProps' to fix the error.`,
  );

  return (
    <PropsProvider {...props}>
      <InternalProvider>
        <Root ref={ref} {...props} />
      </InternalProvider>
    </PropsProvider>
  );
});
