import { Dimensions, Platform } from 'react-native';

export function isIphoneX(): boolean {
  // @ts-ignore
  const isIphone = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS;
  const { width, height } = Dimensions.get('window');

  return isIphone && ((height === 812 || width === 812) || (height === 896 || width === 896));
}
