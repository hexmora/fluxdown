import type { TexRender } from '../../../../base';

import { katexTexToHtml } from '../../../../base/tex-katex';
import { texToSvg } from './mathjax';

export const renderTex: TexRender = (tex, mode) => katexTexToHtml(tex, mode) ?? texToSvg(tex, mode);
