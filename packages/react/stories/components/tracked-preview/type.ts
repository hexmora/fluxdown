import type { IPatchItem } from '@fluxdown/core';
import type { ReactNode } from 'react';

import type { StreamingConfig } from '../../../src/packs/full';
import type { PlaygroundSettings } from '../playground/type';

export interface TrackedPreviewProps {
  actions?: ReactNode;

  ariaLabel: string;

  config: PlaygroundSettings;

  patches?: IPatchItem<ReactNode>[];

  /**
   * Streaming options merged with the compiler's `repairEnding`. Omit to render without smoothing.
   */
  streaming?: StreamingConfig;

  text: string;
}
