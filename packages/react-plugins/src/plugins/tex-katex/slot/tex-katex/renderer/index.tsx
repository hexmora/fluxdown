import { lazy, Suspense } from 'react';

import type { TexKatexRendererProps } from './type';

import { TexRenderer } from '../../../../tex';

export type { TexKatexRendererProps } from './type';

const LazyKatexTexRenderer = /*#__PURE__*/ lazy(() =>
  import('./components/katex-tex').catch(() => ({ default: TexRenderer })),
);

export const TexKatexRenderer = (props: TexKatexRendererProps) => (
  <Suspense fallback={<TexRenderer {...props} />}>
    <LazyKatexTexRenderer {...props} />
  </Suspense>
);
