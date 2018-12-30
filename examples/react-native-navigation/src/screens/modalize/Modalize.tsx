import * as React from 'react';

interface IProps {
  component: React.ReactNode;
}

export default class Modalize extends React.PureComponent<IProps> {

  private modal: React.RefObject<any> = React.createRef();

  /*
   * As soon as the Modalize screen is mounted, which mean the
   * showOverlay from react-native-navigation is triggered, we
   * add a ref to the component inside to call the openModal function
   * See examples/shared/src/components/modals/*.tsx
   */
  componentDidMount() {
    if (this.modal.current) {
      this.modal.current.openModal();
    }
  }

  /*
   * For the purpose of the example, I didn't create multiple screens
   * for all the differents screens, but just a wrapper that takes
   * a component props to change the content of the modal.
   * You can definitly imagine having the react-native-modalize here
   * and pass all the props needed to it.
   */
  render() {
    const { component } = this.props;

    return React.Children.map(component, (c: any) => {
      return React.cloneElement(c, { ref: this.modal });
    });
  }
}
