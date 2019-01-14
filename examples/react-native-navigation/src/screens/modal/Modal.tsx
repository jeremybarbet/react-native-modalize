import * as React from 'react';
import { Navigation } from 'react-native-navigation';
import { Layout, Footer, Button, AbsoluteHeader, SimpleContent, FixedContent, SnappingList, CustomStyle, FlatList, SectionList } from 'react-native-modalize/shared';

import { MODALIZE } from '..';

interface ILink {
  name: string;
  component: React.ReactNode;
}

const Modal = () => {
  const onPress = (component: React.ReactNode) => {
    /*
     * To avoid creating multiple screens for each modal,
     * I just pass the modal content as a props to the
     * Modalize screen
     */
    Navigation.showOverlay({
      component: {
        name: MODALIZE,
        passProps: { component },
        options: { overlay: { interceptTouchOutside: false } },
      },
    });
  };

  const renderButtons = (links: ILink[]) => {
    return links.map(({ name, component }, i) => (
      <Button
        key={i}
        onPress={() => onPress(component)}
        name={name}
      />
    ));
  }

  return (
    <Layout>
      {renderButtons([
        { name: 'Modal with a simple content', component: <SimpleContent /> },
        { name: 'Modal with a fixed content', component: <FixedContent /> },
        { name: 'Modal with a snapping list', component: <SnappingList /> },
        { name: 'Modal with an absolute header', component: <AbsoluteHeader /> },
        { name: 'Modal with custom style', component: <CustomStyle /> },
        { name: 'Modal with a Flat List', component: <FlatList /> },
        { name: 'Modal with a Section List', component: <SectionList /> },
      ])}

      <Footer />
    </Layout>
  );
}

export default Modal;
