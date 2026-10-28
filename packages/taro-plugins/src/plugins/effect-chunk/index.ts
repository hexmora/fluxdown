import { EffectChunkPlugin as _EffectChunkPlugin } from '@fluxdown/react-base-plugins/plugins/effect-chunk';

import { pluginExtends } from '../../base';
import { EffectChunkSlotPlugin } from './slot';

export * from './slot';

export const EffectChunkPlugin = /*#__PURE__*/ pluginExtends(_EffectChunkPlugin, {
  slots: [EffectChunkSlotPlugin],
});
