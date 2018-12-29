import * as React from 'react';

interface IProps {
  children: React.ReactNode;
}

export interface IState {
  toggle: () => void;
  type: string;
}

export const ModalContext = React.createContext({
  toggle: () => {},
  type: 'MODAL_DEFAULT',
});

export default class ModalProvider extends React.PureComponent<IProps, IState> {

  state = {
    toggle: () => {},
    type: 'MODAL_DEFAULT',
  };

  render() {
    const { children } = this.props;

    return (
      <ModalContext.Provider value={this.state}>
        {children}
      </ModalContext.Provider>
    );
  }
}
