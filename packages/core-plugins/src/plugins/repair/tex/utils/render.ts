import { renderToString } from 'katex';

import type { TexRender } from '../type';

export const renderTex: TexRender = (source, mode) => {
  try {
    return renderToString(source, {
      displayMode: mode === 'display',
      maxExpand: 1000,
      maxSize: 20,
      output: 'htmlAndMathml',
      strict: true,
      throwOnError: true,
      trust: false,
    });
  } catch {
    return null;
  }
};
