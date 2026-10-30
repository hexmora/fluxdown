import { EffectShadPlugin as _EffectShadPlugin } from '@fluxdown/react-base-plugins/plugins/effect-shad';

import { pluginExtends } from '../../base';
import { EffectShadSlotPlugin } from './slot';

export * from './slot';

export const EffectShadPlugin = /*#__PURE__*/ pluginExtends(_EffectShadPlugin, {
  slots: [EffectShadSlotPlugin],
});
