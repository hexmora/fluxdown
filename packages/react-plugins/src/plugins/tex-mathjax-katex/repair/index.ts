import type { TexRender } from '../../tex/repair';

import { katexTexToHtml } from '../../tex-katex/engine';
import { texToSvg } from '../engine';

export const renderTex: TexRender = (tex, mode) => {
  return katexTexToHtml(tex, mode) ?? texToSvg(tex, mode);
};
