import { EffectSuffixPlugin as _EffectSuffixPlugin } from '@fluxdown/react-base-plugins/plugins/effect-suffix';

import { pluginExtends } from '../../base';
import { EffectSuffixSlotPlugin } from './slot';

export * from './slot';

export const EffectSuffixPlugin = /*#__PURE__*/ pluginExtends(_EffectSuffixPlugin, {
  slots: [EffectSuffixSlotPlugin],
});
