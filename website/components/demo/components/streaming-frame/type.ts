import type { ReactNode } from 'react';

import type { DemoControls } from '../../type';

export type StreamingFrameProps = {
  label: string;

  caption?: ReactNode;

  controls?: DemoControls;

  children: ReactNode;
};
