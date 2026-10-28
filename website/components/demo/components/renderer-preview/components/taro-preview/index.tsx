import type { FluxdownProps } from '@fluxdown/taro';

import { NoSSR } from '@rspress/core/runtime';
import { lazy, Suspense } from 'react';

const Fluxdown = /*#__PURE__*/ lazy(async () => {
  const taro = await import('@fluxdown/taro');

  return { default: taro.Fluxdown };
});

export const TaroPreview = (props: FluxdownProps) => {
  return (
    <NoSSR>
      <Suspense fallback={null}>
        <Fluxdown {...props} />
      </Suspense>
    </NoSSR>
  );
};
