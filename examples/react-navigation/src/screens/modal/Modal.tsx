import React from 'react';
import { Layout, Footer, Button } from 'shared';

import { ModalContext, IState } from '../../components/modal-provider/ModalProvider';

interface IProps {
  context: IState;
}

interface ILink {
  id: string;
  name: string;
}

const ModalScreen = (props: IProps) => {
  console.log('-modal', ModalScreen.contextType.modal);

  const onPress = (id: string) => {
    // @todo: pseudo code
    ModalScreen.contextType.modal.type = id;
  };

  const renderButtons = (links: ILink[]) => {
    return links.map(({ id, name }, i) => (
      <Button
        key={i}
        onPress={() => onPress(id)}
        name={name}
      />
    ));
  }

  return (
    <Layout>
      {renderButtons([
        { id: 'MODAL_DEFAULT', name: 'Modal with a default content' },
        { id: 'MODAL_FIXED', name: 'Modal with a fixed content' },
        { id: 'MODAL_SNAPPING', name: 'Modal with a snapping list' },
        { id: 'MODAL_ABSOLUTE', name: 'Modal with an absolute header' },
        { id: 'MODAL_INPUT', name: 'Modal with an input' },
      ])}

      <Footer />
    </Layout>
  );
}

ModalScreen.contextType = {
  modal: ModalContext,
};

export default ModalScreen;
