export const invariant = (condition: unknown, message?: string) => {
  if (condition) {
    throw new TypeError(`[react-native-modalize] ${message}`);
  }
};
