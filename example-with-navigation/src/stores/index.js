import { MainStore } from "./MainStore";
import { ModalStore } from "./ModalStore";

export class RootStore {
  constructor() {
    this.modalStore        = new ModalStore(this);
    this.mainStore         = new MainStore(this);
  }
}
