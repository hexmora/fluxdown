import { ErrorBoundary, lazy, Suspense } from 'solid-js';

import type { TexProps } from '../../../../../base';

import { TexRenderer } from '../../../../tex';
import { TexKatexRenderer } from '../../../../tex-katex';

const MathjaxTexRenderer = /*#__PURE__*/ lazy(() => import('./components/mathjax-tex'));

const MathjaxRenderer = (props: TexProps) => {
  return (
    <ErrorBoundary fallback={<TexRenderer {...props} />}>
      <Suspense fallback={<TexRenderer {...props} />}>
        <MathjaxTexRenderer {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export const TexMathjaxKatexRenderer = (props: TexProps) => {
  return <TexKatexRenderer {...props} Fallback={MathjaxRenderer} />;
};
