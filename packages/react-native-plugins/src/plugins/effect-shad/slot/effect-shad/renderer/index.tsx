import { Easing } from 'react-native';

import type { ShadProps } from '../../../../../base';

import { AppearText } from '../../../../../base';

// Linear alpha over time reads as an even gradient across the tail at a steady pace.
export const ShadRenderer = ({ children, duration, start }: ShadProps) => (
  <AppearText duration={duration} easing={Easing.linear} start={start}>
    {children}
  </AppearText>
);
