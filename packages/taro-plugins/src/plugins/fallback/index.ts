import { FallbackPlugin as _FallbackPlugin } from '@fluxdown/react-base-plugins/plugins/fallback';

import { pluginExtends } from '../../base';
import { ElementSlotPlugin } from './slot';

export * from './slot';

export const FallbackPlugin = /*#__PURE__*/ pluginExtends(_FallbackPlugin, {
  slots: [ElementSlotPlugin],
});
