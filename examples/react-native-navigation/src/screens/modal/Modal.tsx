import React from 'react';
import { Navigation } from 'react-native-navigation';
import { Layout, Footer, Button } from 'shared';

import { MODAL_DEFAULT, MODAL_FIXED, MODAL_SNAPPING, MODAL_ABSOLUTE, MODAL_INPUT } from '..';

interface ILink {
  id: string;
  name: string;
}

const Modal = () => {
  const onPress = (id: string) => {
    /*
     * If you need to pass any props to the modal you
     * can use the key passProps, you can also pass some options.
     * Check the react-native-navigation's documentation for more infos.
     */
    Navigation.showOverlay({
      component: {
        name: id,
        options: { overlay: { interceptTouchOutside: false } },
      },
    });
  };

  const renderButtons = (links: ILink[]) => {
    return links.map(({ id, name }, i) => (
      <Button
        key={i}
        onPress={() => onPress(id)}
        name={name}
      />
    ));
  }

  return (
    <Layout>
      {renderButtons([
        { id: MODAL_DEFAULT, name: 'Modal with a default content' },
        { id: MODAL_FIXED, name: 'Modal with a fixed content' },
        { id: MODAL_SNAPPING, name: 'Modal with a snapping list' },
        { id: MODAL_ABSOLUTE, name: 'Modal with an absolute header' },
        { id: MODAL_INPUT, name: 'Modal with an input' },
      ])}

      <Footer />
    </Layout>
  );
}

export default Modal;
