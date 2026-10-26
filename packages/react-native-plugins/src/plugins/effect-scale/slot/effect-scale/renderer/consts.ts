import { Easing } from 'react-native';

export const EASE_OUT = /*#__PURE__*/ Easing.out(Easing.cubic);

export const STEPS = /*#__PURE__*/ Array.from({ length: 11 }, (_, index) => index / 10);

export const OPACITY = [
  0, 0.073441, 0.238144, 0.431649, 0.614656, 0.765625, 0.876096, 0.946729, 0.984064, 0.998001, 1,
];

export const BLUR = [
  1, 0.987688, 0.951057, 0.891007, 0.809017, 0.707107, 0.587785, 0.45399, 0.309017, 0.156434, 0,
];
