import { observable, action } from "mobx";
import React from 'react';

export class ModalStore {

  @observable isVisible = false ;
  modal ;
  settings = {};
  Component;

  constructor(stores){
    this.stores = stores;
  }


  @action
  open = () => {
    if (this.modal) {
      this.modal.open();
    }
  }

  @action
  close = () => {
    if (this.modal) {
      this.modal.close();
    }
  }

  onClosed = () => {
    this.destroyModal();
  }


  @action
  destroyModal = () => {
    setTimeout( () => {
      this.isVisible = false;
      this.settings = null;
      this.Component = null;
      this.modal = null;
    }, 0);
  }
}
