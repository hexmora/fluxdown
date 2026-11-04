import type { PluggableConfigs } from '@fluxdown/types';

import '../../plugins/blockquote';
import '../../plugins/break-line';
import '../../plugins/heading';
import '../../plugins/paragraph';
import '../../plugins/strong';
import '../../plugins/emphasis';
import '../../plugins/list';
import '../../plugins/image';
import '../../plugins/link';
import '../../plugins/tex';
import '../../plugins/effect-chunk';
import '../../plugins/effect-suffix';
import '../../plugins/patch';
import '../../plugins/cjk';
import '../../plugins/emoji';

export type PluginConfigs = PluggableConfigs<MapperConfigs> &
  Partial<RemarkConfigs & RehypeConfigs & RepairConfigs & VueRenderConfigs & VueSlotConfigs>;
