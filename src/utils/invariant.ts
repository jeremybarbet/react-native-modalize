export const invariant = (condition: unknown, message?: string): void => {
  if (condition) {
    throw new TypeError(`[react-native-modalize] ${message}`);
  }
};
