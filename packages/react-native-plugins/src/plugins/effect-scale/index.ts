import { EffectScalePlugin as _EffectScalePlugin } from '@fluxdown/react-base-plugins/plugins/effect-scale';

import { pluginExtends } from '../../base';
import { EffectScaleSlotPlugin, EffectScaleWordSlotPlugin } from './slot';

export * from './slot';

export const EffectScalePlugin = /*#__PURE__*/ pluginExtends(_EffectScalePlugin, {
  slots: [EffectScaleSlotPlugin, EffectScaleWordSlotPlugin],
});
