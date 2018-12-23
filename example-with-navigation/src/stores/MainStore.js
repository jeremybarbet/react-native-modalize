import { observable, action, autorun, reaction } from "mobx";


export class MainStore {

  constructor(stores){
    this.stores = stores;
  }

}
