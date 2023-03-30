import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isIos = Platform.OS === 'ios';

const DEVICE_LAYOUT_MAX_VALUES: { [key: number]: string } = {
  780: "iPhone",
  812: "iPhoneX",
  896: "iPhoneXMax",
  844: "iPhone12",
  926: "iPhone12Max",
  852: "iPhone14Pro",
  932: "iPhone14ProMax",
};

const targetIphoneSafeArea = (wWidth: number, wHeight: number) => {
  const equalWidth = DEVICE_LAYOUT_MAX_VALUES[wWidth] ?? null;
  const equalHeight = DEVICE_LAYOUT_MAX_VALUES[wHeight] ?? null;

  if (equalWidth !== null) {
    return equalWidth;
  }

  if (equalHeight !== null) {
    return equalHeight;
  }

  return null;
};

const targetIPhoneOffsetHeight: { [key: string]: number } = {
  iPhone: 34,
  iPhoneX: 44,
  iPhoneXMax: 44,
  iPhone12: 47,
  iPhone12Max: 47,
  iPhone14Pro: 59,
  iPhone14ProMax: 59,
};

export const iphoneOffsetHeight = () => {
  const iphoneType = targetIphoneSafeArea(width, height);

  return isIos && iphoneType !== null
    ? targetIPhoneOffsetHeight[iphoneType]
    : 0;
};

export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
