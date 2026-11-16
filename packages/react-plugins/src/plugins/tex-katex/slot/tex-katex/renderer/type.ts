import type { ComponentType } from 'react';

import type { TexProps } from '../../../../../base';

export interface TexKatexRendererProps extends TexProps {
  Fallback?: ComponentType<TexProps>;
}
