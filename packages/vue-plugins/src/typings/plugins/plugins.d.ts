import type { PluggableConfigs } from '@fluxdown/types';

import '../../plugins/blockquote';
import '../../plugins/break-line';
import '../../plugins/cjk';
import '../../plugins/code';
import '../../plugins/tex-mathjax-katex';
import '../../plugins/tex-katex';
import '../../plugins/code-shiki';
import '../../plugins/code-prism';
import '../../plugins/code-pele';
import '../../plugins/effect-chunk';
import '../../plugins/effect-scale';
import '../../plugins/effect-shad';
import '../../plugins/effect-suffix';
import '../../plugins/emoji';
import '../../plugins/emphasis';
import '../../plugins/fallback';
import '../../plugins/heading';
import '../../plugins/image';
import '../../plugins/link';
import '../../plugins/list';
import '../../plugins/paragraph';
import '../../plugins/patch';
import '../../plugins/strong';
import '../../plugins/table';
import '../../plugins/tex';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  Partial<RemarkConfigs & RehypeConfigs & RepairConfigs & VueRenderConfigs & VueSlotConfigs>;
