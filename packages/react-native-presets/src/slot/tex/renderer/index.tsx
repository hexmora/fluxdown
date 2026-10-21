import { lazy, Suspense } from 'react';

import type { TexProps } from '../../../base';

import { Fallback } from './components/fallback';

const MathjaxTex = lazy(() => {
  // MathJax uses these navigator fields for platform detection, even with its lite adaptor.
  const navigator = globalThis.navigator as
    | {
        appVersion?: string;

        userAgent?: string;
      }
    | undefined;

  if (navigator) {
    navigator.appVersion ??= '';

    navigator.userAgent ??= '';
  }

  return import('./components/mathjax-tex');
});

export const TexRenderer = (props: TexProps) => (
  <Suspense fallback={<Fallback {...props} />}>
    <MathjaxTex {...props} />
  </Suspense>
);
