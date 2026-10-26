import { lazy, Suspense } from 'react';

import type { CodeHighlighterProps } from '../../../../../base';

const LazyHighlightRenderer = /*#__PURE__*/ lazy(() => import('./components/highlight'));

export const CodeHighlightRenderer = ({ Raw, ...props }: CodeHighlighterProps) => (
  <Suspense fallback={Raw && <Raw {...props} />}>
    <LazyHighlightRenderer {...props} Raw={Raw} />
  </Suspense>
);
