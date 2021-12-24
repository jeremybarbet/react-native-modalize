import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isIos = Platform.OS === 'ios';
export const isIphoneX =
  isIos &&
  (height === 780 ||
    width === 780 ||
    height === 812 ||
    width === 812 ||
    height === 844 ||
    width === 844 ||
    height === 896 ||
    width === 896 ||
    height === 926 ||
    width === 926);

export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
