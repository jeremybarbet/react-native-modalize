import * as React from 'react';
import { Layout, Header, Footer, Button, AbsoluteHeader, SimpleContent, FixedContent, SnappingList, CustomStyle, FlatList, SectionList } from 'react-native-modalize/shared';

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
        'Modal with a simple content',
        'Modal with a fixed content',
        'Modal with a snapping list',
        'Modal with an absolute header',
        'Modal with custom style',
        'Modal with a Flat List',
        'Modal with a Section List',
      ])}

      <Footer />

      <SimpleContent ref={(el: SimpleContent) => { modal[0] = el; }} />
      <FixedContent ref={(el: FixedContent) => { modal[1] = el; }} />
      <SnappingList ref={(el: SnappingList) => { modal[2] = el; }} />
      <AbsoluteHeader ref={(el: AbsoluteHeader) => { modal[3] = el; }} />
      <CustomStyle ref={(el: CustomStyle) => { modal[4] = el; }} />
      <FlatList ref={(el: FlatList) => { modal[5] = el; }} />
      <SectionList ref={(el: SectionList) => { modal[6] = el; }} />
    </Layout>
  );
}

export default App;
