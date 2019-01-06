import React from 'react';
import { Layout, Header, Footer, Button, AbsoluteHeader, DefaultContent, FixedContent, SnappingList, CustomStyle } from 'react-native-modalize/shared';

const App = () => {
  const modal: any[] = [];

  const renderButtons = (links: string[]) => {
    return links.map((link, i) => (
      <Button
        key={i}
        onPress={() => modal[i].openModal()}
        name={link}
      />
    ));
  };

  return (
    <Layout>
      <Header
        subheading="Run with Expo"
        copy="Simple example without any navigation"
      />

      {renderButtons([
        'Modal with a default content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with custom style',
      ])}

      <Footer />

      <DefaultContent ref={(el: DefaultContent) => { modal[0] = el; }} />
      <FixedContent ref={(el: FixedContent) => { modal[1] = el; }} />
      <SnappingList ref={(el: SnappingList) => { modal[2] = el; }} />
      <AbsoluteHeader ref={(el: AbsoluteHeader) => { modal[3] = el; }} />
      <CustomStyle ref={(el: CustomStyle) => { modal[4] = el; }} />
    </Layout>
  );
}

export default App;
