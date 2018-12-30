import * as React from 'react';

import AppNavigator from './src/screens';
import Modalize from './src/components/modalize/Modalize';

export interface IState {
  toggleModal: (id?: string) => void;
  type: string;
  isOpen: boolean;
}

export const ModalContext = React.createContext<IState>({
  toggleModal: () => {},
  type: 'MODAL_DEFAULT',
  isOpen: false,
});

export default class App extends React.PureComponent<any, IState> {

  private toggleModal: (id?: string) => void;

  constructor(props: any) {
    super(props);

    this.toggleModal = (id?: string) => {
      this.setState({
        type: id || 'MODAL_DEFAULT',
        isOpen: Boolean(id),
      });
    };

    this.state = {
      toggleModal: this.toggleModal,
      type: 'MODAL_DEFAULT',
      isOpen: false,
    };
  }

  render() {
    return (
      <ModalContext.Provider value={this.state}>
        <AppNavigator />

        <ModalContext.Consumer>
          {(context) => (
            <Modalize context={context} />
          )}
        </ModalContext.Consumer>
      </ModalContext.Provider>
    );
  }
}
