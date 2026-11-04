import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { EffectSuffixPlugin as _EffectSuffixPlugin } from '@fluxdown/vue-base-plugins/plugins/effect-suffix';

import { EffectSuffixSlotPlugin } from './slot';

export * from './slot';

export const EffectSuffixPlugin = /*#__PURE__*/ pluginExtends(_EffectSuffixPlugin, {
  slots: [EffectSuffixSlotPlugin],
});
