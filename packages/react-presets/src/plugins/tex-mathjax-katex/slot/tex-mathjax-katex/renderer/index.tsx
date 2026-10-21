import { lazy, Suspense } from 'react';

import type { TexProps } from '../../../../../base';

import { TexRenderer } from '../../../../tex';
import { TexKatexRenderer } from '../../../../tex-katex';

const LazyMathjaxTexRenderer = /*#__PURE__*/ lazy(() =>
  import('./components/mathjax-tex').catch(() => ({ default: TexRenderer })),
);

const MathjaxTexRenderer = (props: TexProps) => (
  <Suspense fallback={<TexRenderer {...props} />}>
    <LazyMathjaxTexRenderer {...props} />
  </Suspense>
);

export const TexMathjaxKatexRenderer = (props: TexProps) => (
  <TexKatexRenderer {...props} Fallback={MathjaxTexRenderer} />
);
