import { lazy, Suspense, useState } from 'react';

import { isRepairingTex, type TexProps } from '../../../../../base';
import { TexLoadingRenderer, TexRenderer } from '../../../../tex';
import { TexKatexRenderer } from '../../../../tex-katex';

const LazyMathjaxTexRenderer = /*#__PURE__*/ lazy(() =>
  import('./components/mathjax-tex').catch(() => ({ default: TexRenderer })),
);

const LazyRepairedTexRenderer = /*#__PURE__*/ lazy(() =>
  import('./components/repaired-tex').catch(() => ({ default: TexRenderer })),
);

const MathjaxTexRenderer = (props: TexProps) => (
  <Suspense fallback={<TexLoadingRenderer {...props} />}>
    <LazyMathjaxTexRenderer {...props} />
  </Suspense>
);

export const TexMathjaxKatexRenderer = (props: TexProps) => {
  const [streamed, setStreamed] = useState(false);

  if (!streamed && isRepairingTex(props.current)) {
    setStreamed(true);
  }

  if (streamed) {
    return (
      <Suspense fallback={<TexKatexRenderer {...props} />}>
        <LazyRepairedTexRenderer {...props} />
      </Suspense>
    );
  }

  return <TexKatexRenderer {...props} Fallback={MathjaxTexRenderer} />;
};
