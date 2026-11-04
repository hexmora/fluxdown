import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { EffectChunkPlugin as _EffectChunkPlugin } from '@fluxdown/vue-base-plugins/plugins/effect-chunk';

import { EffectChunkSlotPlugin } from './slot';

export * from './slot';

export const EffectChunkPlugin = /*#__PURE__*/ pluginExtends(_EffectChunkPlugin, {
  slots: [EffectChunkSlotPlugin],
});
