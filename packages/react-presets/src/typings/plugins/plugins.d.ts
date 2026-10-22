import type { PluggableConfigs } from '@fluxdown/types';

import '../../plugins/blockquote';
import '../../plugins/break-line';
import '../../plugins/code';
import '../../plugins/code-pele';
import '../../plugins/code-prism';
import '../../plugins/code-shiki';
import '../../plugins/effect-chunk';
import '../../plugins/effect-scale';
import '../../plugins/effect-shad';
import '../../plugins/effect-suffix';
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
import '../../plugins/tex-katex';
import '../../plugins/tex-mathjax-katex';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  Partial<RemarkConfigs & RehypeConfigs & RepairConfigs & RenderConfigs & SlotConfigs>;
