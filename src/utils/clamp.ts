export const clamp = (min: number, max: number, val: number) => {
  return Math.min(Math.max(min, val), max);
};
