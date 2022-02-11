import React, { createContext, FC, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

interface InternalContextProps {
  dragY: SharedValue<number>;
  translateY: SharedValue<number>;
}

const InternalContext = createContext<InternalContextProps>({
  dragY: useSharedValue(0),
  translateY: useSharedValue(0),
});

export const InternalProvider: FC = ({ children }) => {
  const dragY = useSharedValue(0);
  const translateY = useSharedValue(0);

  const onClose = () => {};

  const onOpen = () => {};

  return (
    <InternalContext.Provider
      value={{
        dragY,
        translateY,
      }}
    >
      {children}
    </InternalContext.Provider>
  );
};

export const useInternal = () => {
  return useContext(InternalContext);
};
