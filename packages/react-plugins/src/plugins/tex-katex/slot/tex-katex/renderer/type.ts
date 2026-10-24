import type { ComponentType } from 'react';

import type { TexProps } from '../../../../../base';

export type TexKatexRendererProps = TexProps & { Fallback?: ComponentType<TexProps> };
