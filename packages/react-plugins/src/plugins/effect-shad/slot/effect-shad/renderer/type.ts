import type { CSSProperties } from 'react';

import type { ShadProps } from '../../../../../base';

export type ShadRendererProps = Omit<ShadProps, 'Raw'>;

export interface ShadMaskStyle extends CSSProperties {
  '--mask-width': string;
}
