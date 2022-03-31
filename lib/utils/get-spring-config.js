"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpringConfig = void 0;
const invariant_1 = require("./invariant");
exports.getSpringConfig = (config) => {
    const { friction, tension, speed, bounciness, stiffness, damping, mass } = config;
    if (stiffness || damping || mass) {
        invariant_1.invariant(bounciness || speed || tension || friction, `You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one`);
        return {
            stiffness,
            damping,
            mass,
        };
    }
    else if (bounciness || speed) {
        invariant_1.invariant(tension || friction || stiffness || damping || mass, `You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one`);
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
