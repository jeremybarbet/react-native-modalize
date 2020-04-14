import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isIos = Platform.OS === 'ios';
export const isIphoneX =
  isIos && (height === 812 || width === 812 || height === 896 || width === 896);
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
