import React from 'react';
import { Layout, Footer, Button } from 'shared';

import { ModalContext } from '../../../App';

interface IProps {
  toggleModal: (id: string) => void;
}

interface ILink {
  id: string;
  name: string;
}

export default class ModalScreen extends React.PureComponent<IProps> {

  static contextType = ModalContext;

  private onPress = (id: string) => {
    this.props.toggleModal(id);
  }

  private renderButtons = (links: ILink[]) => {
    return links.map(({ id, name }, i) => (
      <Button
        key={i}
        onPress={() => this.onPress(id)}
        name={name}
      />
    ));
  }

  render() {
    return (
      <Layout>
        {this.renderButtons([
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
}
