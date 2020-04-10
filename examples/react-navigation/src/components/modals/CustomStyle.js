import React, { useRef, forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modalize } from 'react-native-modalize';
import faker from 'faker';

import { useCombinedRefs } from '../../utils/use-combined-refs';

export const CustomStyle = forwardRef((_, ref) => {
  const modalRef = useRef(null);
  const combinedRef = useCombinedRefs(ref, modalRef);

  const renderContent = () => (
    <View style={s.content}>
      <Text style={s.content__heading}>Article title</Text>
      <Text style={s.content__paragraph}>{faker.lorem.paragraphs(3)}</Text>
    </View>
  );

  return (
    <Modalize
      ref={combinedRef}
      modalStyle={s.modal}
      modalHeight={350}
      overlayStyle={s.overlay}
      handleStyle={s.handle}
      handlePosition="inside"
      openAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 },
      }}
      closeAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 },
      }}
    >
      {renderContent()}
    </Modalize>
  );
});

const s = StyleSheet.create({
  content: {
    padding: 15,
  },

  content__heading: {
    marginVertical: 10,

    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },

  content__paragraph: {
    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },

  modal: {
    margin: 20,

    backgroundColor: '#cac9dd',
    borderRadius: 20,

    shadowOpacity: 0,
  },

  overlay: {
    backgroundColor: 'rgba(41, 36, 107, 0.9)',
  },

  handle: {
    width: 150,

    backgroundColor: '#b0afbc',
  },
});
