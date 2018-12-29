import * as React from 'react';

import { ModalContext } from '../../../App';

import Modal from './Modal';

const ModalConsumer = () => (
  <ModalContext.Consumer>
    {({ toggleModal }) => (
      <Modal toggleModal={toggleModal} />
    )}
  </ModalContext.Consumer>
);

export default ModalConsumer;
