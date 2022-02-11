import * as React from 'react';
import { Dimensions, EmitterSubscription, ScaledSize } from 'react-native';

export const useDimensions = (): ScaledSize => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  const onChange = ({ window }: { window: ScaledSize }): void => {
    setDimensions(window);
  };

  React.useEffect(() => {
    let dimensionChangeListener: EmitterSubscription | null = null;

    dimensionChangeListener = Dimensions.addEventListener('change', onChange);

    return () => {
      dimensionChangeListener?.remove();
    };
  }, []);

  return dimensions;
};
