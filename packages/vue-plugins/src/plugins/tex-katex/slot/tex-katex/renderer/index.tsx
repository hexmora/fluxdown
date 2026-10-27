import { defineAsyncComponent } from 'vue';

import type { TexKatexRendererProps } from './type';

import { TexRenderer } from '../../../../tex';

export type { TexKatexRendererProps } from './type';

const KatexTexRenderer = /*#__PURE__*/ defineAsyncComponent({
  loader: () => import('./components/katex-tex').then((module) => module.default),
  loadingComponent: TexRenderer,
  errorComponent: TexRenderer,
  delay: 0,
});

export const TexKatexRenderer = (props: TexKatexRendererProps) => {
  return <KatexTexRenderer {...props} />;
};
