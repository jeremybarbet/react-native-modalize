import * as React from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export const useDimensions = (): ScaledSize => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  const onChange = ({ window }: { window: ScaledSize }): void => {
    setDimensions(window);
  };

  React.useEffect(() => {
    Dimensions.addEventListener('change', onChange);

    return (): void => Dimensions.removeEventListener('change', onChange);
  }, []);

  return dimensions;
};
