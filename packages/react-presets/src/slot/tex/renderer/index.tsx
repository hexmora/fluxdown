import { lazy, Suspense } from 'react';

import type { TexProps } from '../../../base';

import { getReactProps } from '../../../base';
import { LightTexRenderer } from './components/light-tex';

const LazyMathjaxKatexTexRenderer = /*#__PURE__*/ lazy(async () => {
  try {
    const Component = await import('./components/mathjax-katex-tex');

    return Component;
  } catch {
    return { default: LightTexRenderer };
  }
});

export const TexRenderer = (props: TexProps) => {
  const elementProps = { ...getReactProps(props.current), ...props };

  return (
    <Suspense fallback={<LightTexRenderer {...elementProps} />}>
      <LazyMathjaxKatexTexRenderer {...elementProps} />
    </Suspense>
  );
};
