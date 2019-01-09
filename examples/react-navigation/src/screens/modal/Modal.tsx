import * as React from 'react';
import { Layout, Footer, Button } from 'react-native-modalize/shared';

import { ModalContext } from '../../../App';

interface IProps {
  toggleModal: (id?: string) => void;
}

interface ILink {
  id: string;
  name: string;
}

export default class ModalScreen extends React.PureComponent<IProps> {

  static contextType = ModalContext;

  private renderButtons = (links: ILink[]) => {
    const { toggleModal } = this.props;

    return links.map(({ id, name }, i) => (
      <Button
        key={i}
        onPress={() => toggleModal(id)}
        name={name}
      />
    ));
  }

  render() {
    return (
      <Layout>
        {this.renderButtons([
          { id: 'MODAL_SIMPLE', name: 'Modal with a simple content' },
          { id: 'MODAL_FIXED', name: 'Modal with a fixed content' },
          { id: 'MODAL_SNAPPING', name: 'Modal with a snapping list' },
          { id: 'MODAL_ABSOLUTE', name: 'Modal with an absolute header' },
          { id: 'MODAL_CUSTOM', name: 'Modal with custom style' },
          { id: 'MODAL_FLAT', name: 'Modal with a Flat List' },
          { id: 'MODAL_SECTION', name: 'Modal with a Section List' },
        ])}

        <Footer />
      </Layout>
    );
  }
}
