import React, { createContext, Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { useProps } from './PropsProvider';

interface InternalContextProps {
  disableScroll: boolean | undefined;
  setDisableScroll: Dispatch<SetStateAction<boolean | undefined>>;

  overlay: SharedValue<number>;
  dragY: SharedValue<number>;
  translateY: SharedValue<number>;
}

const InternalContext = createContext<InternalContextProps>({
  disableScroll: undefined,
  setDisableScroll: () => null,
  overlay: useSharedValue(0),
  dragY: useSharedValue(0),
  translateY: useSharedValue(0),
});

export const InternalProvider: FC = ({ children }) => {
  const { alwaysOpen, snapPoint } = useProps();
  const [disableScroll, setDisableScroll] = useState(alwaysOpen || snapPoint ? true : undefined);
  const overlay = useSharedValue(0);
  const dragY = useSharedValue(0);
  const translateY = useSharedValue(0);

  return (
    <InternalContext.Provider
      value={{
        disableScroll,
        setDisableScroll,
        overlay,
        dragY,
        translateY,
      }}
    >
      {children}
    </InternalContext.Provider>
  );
};

export const useInternal = () => useContext(InternalContext);
