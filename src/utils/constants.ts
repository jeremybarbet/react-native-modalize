/**
 * When scrolling, it happens than beginScrollYValue is not always equal to 0 (top of the ScrollView).
 * Since we use this to trigger the swipe down gesture animation, we allow a small threshold to
 * not dismiss Modalize when we are using the ScrollView and we don't want to dismiss.
 */
export const constants = {
  scrollThreshold: -4,
  activated: 20,
  panDuration: 150,
  useNativeDriver: true,

  animations: {
    dragToss: 0.18,
    threshold: 120,
    velocity: 2800,
  },

  timingConfig: {
    duration: 240,
  },

  springConfig: {
    damping: 50,
    mass: 0.3,
    stiffness: 120,
  },
};
