import { ErrorBoundary, lazy, Suspense } from 'solid-js';

import type { TexKatexRendererProps } from './type';

import { TexRenderer } from '../../../../tex';

export type { TexKatexRendererProps } from './type';

const KatexTexRenderer = /*#__PURE__*/ lazy(() => import('./components/katex-tex'));

export const TexKatexRenderer = (props: TexKatexRendererProps) => {
  return (
    <ErrorBoundary fallback={<TexRenderer {...props} />}>
      <Suspense fallback={<TexRenderer {...props} />}>
        <KatexTexRenderer {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};
