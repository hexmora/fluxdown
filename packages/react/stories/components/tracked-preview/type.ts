import type { IPatchItem } from '@fluxdown/core';
import type { ReactNode } from 'react';

import type { PlaygroundSettings } from '../playground/type';

export interface TrackedPreviewProps {
  actions?: ReactNode;

  ariaLabel: string;

  config: PlaygroundSettings;

  patches?: IPatchItem<ReactNode>[];

  text: string;
}
