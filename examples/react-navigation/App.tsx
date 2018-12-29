import * as React from 'react';

import AppNavigator from './src/screens';
import Modalize from './src/components/modalize/Modalize';

interface IState {
  toggleModal: (id: string) => void;
  type: string;
  isOpen: boolean;
}

export const ModalContext = React.createContext({
  toggleModal: () => {},
  type: 'MODAL_DEFAULT',
  isOpen: false,
});

export default class App extends React.PureComponent<any, IState> {

  private toggleModal: (id: string) => void;

  constructor(props: any) {
    super(props);

    this.toggleModal = (id: string) => {
      console.log('-id', id);

      this.setState({
        type: id,
        isOpen: true,
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
          {({ isOpen, type }) => (
            <Modalize
              isOpen={isOpen}
              type={type}
            />
          )}
        </ModalContext.Consumer>
      </ModalContext.Provider>
    );
  }
}
