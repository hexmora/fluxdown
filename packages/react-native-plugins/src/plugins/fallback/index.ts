import { FallbackPlugin as _FallbackPlugin } from '@fluxdown/react-base-plugins/plugins/fallback';

import { pluginExtends } from '../../base';
import { NativeFallbackRenderPlugin } from './render';
import { ElementSlotPlugin } from './slot';

export * from './render';
export * from './slot';

export const FallbackPlugin = /*#__PURE__*/ pluginExtends(_FallbackPlugin, {
  renders: [NativeFallbackRenderPlugin],
  slots: [ElementSlotPlugin],
});
