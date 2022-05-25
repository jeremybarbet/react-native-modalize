import { useEffect, useState } from 'react';
import { Dimensions, EmitterSubscription, ScaledSize } from 'react-native';

import { isBelowRN65 } from '../utils/libraries';

export const useDimensions = (): ScaledSize => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const onChange = ({ window }: { window: ScaledSize }): void => {
    setDimensions(window);
  };

  useEffect(() => {
    let dimensionChangeListener: EmitterSubscription | null = null;

    if (isBelowRN65) {
      Dimensions.addEventListener('change', onChange);
    } else {
      dimensionChangeListener = Dimensions.addEventListener('change', onChange);
    }

    return () => {
      if (isBelowRN65) {
        Dimensions.removeEventListener('change', onChange);
      } else {
        dimensionChangeListener?.remove();
      }
    };
  }, []);

  return dimensions;
};
