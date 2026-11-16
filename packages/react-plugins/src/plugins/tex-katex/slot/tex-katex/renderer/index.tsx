import { lazy, Suspense } from 'react';

import type { TexKatexRendererProps } from './type';

import { TexLoadingRenderer, TexRenderer } from '../../../../tex';

export type { TexKatexRendererProps } from './type';

const LazyKatexTexRenderer = /*#__PURE__*/ lazy(() =>
  import('./components/katex-tex').catch(() => ({ default: TexRenderer })),
);

export const TexKatexRenderer = (props: TexKatexRendererProps) => {
  return (
    <Suspense fallback={<TexLoadingRenderer {...props} />}>
      <LazyKatexTexRenderer {...props} />
    </Suspense>
  );
};
