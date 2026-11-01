import { NoSSR } from '@rspress/core/runtime';
import { lazy, Suspense } from 'react';

import type { AngularPreviewProps } from './type';

const Preview = /*#__PURE__*/ lazy(async () => {
  const renderer = await import('./preview');

  return { default: renderer.Preview };
});

export const AngularPreview = (props: AngularPreviewProps) => {
  return (
    <NoSSR>
      <Suspense fallback={null}>
        <Preview {...props} />
      </Suspense>
    </NoSSR>
  );
};
