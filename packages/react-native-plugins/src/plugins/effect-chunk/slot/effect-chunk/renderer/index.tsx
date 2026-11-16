import type { ChunkProps } from '../../../../../base';

import { AppearText } from '../../../../../base';
import { EASE_OUT } from './consts';

export const ChunkRenderer = ({ children, duration, start }: ChunkProps) => (
  <AppearText duration={duration} easing={EASE_OUT} start={start}>
    {children}
  </AppearText>
);
