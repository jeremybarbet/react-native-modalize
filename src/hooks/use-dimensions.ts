import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export const useDimensions = (): ScaledSize => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const onChange = ({ window }: { window: ScaledSize }): void => {
    setDimensions(window);
  };

  useEffect(() => {
    const dimensionChangeListener = Dimensions.addEventListener('change', onChange);

    return () => {
      dimensionChangeListener?.remove();
    };
  }, []);

  return dimensions;
};
