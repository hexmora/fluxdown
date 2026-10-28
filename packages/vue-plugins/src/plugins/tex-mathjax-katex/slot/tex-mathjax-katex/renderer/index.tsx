import { defineAsyncComponent } from 'vue';

import type { TexProps } from '../../../../../base';

import { TexRenderer } from '../../../../tex';
import { TexKatexRenderer } from '../../../../tex-katex';

const MathjaxTexRenderer = /*#__PURE__*/ defineAsyncComponent({
  loader: () => import('./components/mathjax-tex').then((module) => module.default),
  loadingComponent: TexRenderer,
  errorComponent: TexRenderer,
  delay: 0,
});

export const TexMathjaxKatexRenderer = (props: TexProps) => {
  return <TexKatexRenderer {...props} Fallback={MathjaxTexRenderer} />;
};
