import { ISpringProps } from '../options';

export const getSpringConfig = (config: ISpringProps) => {
  const { friction, tension, speed, bounciness, stiffness, damping, mass } = config;

  if (stiffness || damping || mass) {
    if (bounciness || speed || tension || friction) {
      console.error(`
        [react-native-modalize] You can define one of bounciness/speed, tension/friction,
        or stiffness/damping/mass, but not more than one
      `);
    }

    return {
      stiffness,
      damping,
      mass,
    };
  } else if (bounciness || speed) {
    if (tension || friction || stiffness || damping || mass) {
      console.error(`
        [react-native-modalize] You can define one of bounciness/speed, tension/friction,
        or stiffness/damping/mass, but not more than one
      `);
    }

    return {
      bounciness,
      speed,
    };
  }

  return {
    tension,
    friction,
  };
};
