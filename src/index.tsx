import React, { forwardRef, ReactNode, Ref } from 'react';

import { Root } from './components/Root';
import { InternalProvider } from './context/Internal-provider';
import { invariant } from './utils/invariant';
import { Handles, ModalizeProps } from './options';

const ModalizeWithInternalProvider = (
  props: ModalizeProps,
  ref: Ref<ReactNode>,
): JSX.Element | null => {
  invariant(
    props.modalHeight && props.adjustToContentHeight,
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
    <InternalProvider>
      <Root ref={ref} {...props} />
    </InternalProvider>
  );
};

export type Modalize = Handles;
export const Modalize = forwardRef(ModalizeWithInternalProvider);
