import * as React from 'react';
import { AbsoluteHeader, DefaultContent, FixedContent, InputForm, SnappingList } from 'shared';

import { ModalContext } from '../../../App';

interface IProps {
  isOpen: boolean;
  type: string;
}

export default class Modalize extends React.PureComponent<IProps> {

  static contextType = ModalContext;
  private modal: React.RefObject<any> = React.createRef();

  componentWillReceiveProps(props: IProps) {
    if (props.isOpen && this.modal.current) {
      this.modal.current.openModal();
    }
  }

  get component() {
    const { type } = this.props;

    const modals = [
      { id: 'MODAL_DEFAULT', component: <DefaultContent /> },
      { id: 'MODAL_FIXED', component: <FixedContent /> },
      { id: 'MODAL_SNAPPING', component: <SnappingList /> },
      { id: 'MODAL_ABSOLUTE', component: <AbsoluteHeader /> },
      { id: 'MODAL_INPUT', component: <InputForm /> },
    ];

    // console.log('-this.context.type', this.context.type);
    return modals.find(modal => modal.id === 'MODAL_DEFAULT')!.component;
  }

  render() {
    return React.Children.map(this.component, (c: any) => {
      return React.cloneElement(c, { ref: this.modal });
    });
  }
}
