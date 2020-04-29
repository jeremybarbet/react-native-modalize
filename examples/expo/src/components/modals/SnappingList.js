import React, { useRef, forwardRef } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';
import { Button } from '../button/Button';

export const SnappingList = forwardRef((_, ref) => {
  const modalizeRef = useRef(null);
  const contentRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalizeRef);

  const handleScrollToTop = () => {
    if (contentRef.current) {
      // Old version of react-native, we need to use getNode()
      contentRef.current.getNode().scrollTo({
        y: 0,
        animated: true,
      });
    }
  };

  const renderHeader = () => (
    <View style={s.modal__header}>
      <Text style={s.modal__headerText}>50 users online</Text>
    </View>
  );

  const renderContent = () => (
    <View style={s.content}>
      {Array(50)
        .fill(0)
        .map((_, i) => (
          <View style={s.content__row} key={i}>
            <View style={s.content__avatar}>
              <Image
                style={{ width: '100%', height: '100%' }}
                source={{ uri: faker.image.avatar() }}
              />
            </View>

            <Text style={s.content__name}>{faker.name.findName()}</Text>
          </View>
        ))}

      <View style={s.content__button}>
        <Button onPress={handleScrollToTop} name="Scroll to Top" />
      </View>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      contentRef={contentRef}
      HeaderComponent={renderHeader}
      snapPoint={350}
    >
      {renderContent()}
    </Modalize>
  );
});

const s = StyleSheet.create({
  modal__header: {
    paddingVertical: 15,
    marginHorizontal: 15,

    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },

  modal__headerText: {
    fontSize: 15,
    fontWeight: '200',
  },

  content: {
    paddingHorizontal: 15,
  },

  content__row: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 15,

    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
  },

  content__avatar: {
    width: 38,
    height: 38,

    marginRight: 15,

    overflow: 'hidden',

    backgroundColor: '#eee',
    borderRadius: 19,
  },

  content__name: {
    fontSize: 16,
  },

  content__button: {
    alignItems: 'center',
    justifyContent: 'center',

    marginVertical: 20,
  },
});
