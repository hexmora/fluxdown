import { lazy, Suspense } from 'react';

import type { TexProps } from '../../../../../base';

import { loadSvgRenderer } from './utils';

const LazySvgRenderer = /*#__PURE__*/ lazy(loadSvgRenderer);

export const TexSvgRenderer = ({ Raw, ...props }: TexProps) => {
  return (
    <Suspense fallback={null}>
      <LazySvgRenderer {...props} Raw={Raw} />
    </Suspense>
  );
};
