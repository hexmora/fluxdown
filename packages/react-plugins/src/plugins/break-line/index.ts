import { BreakLinePlugin as _BreakLinePlugin } from '@fluxdown/react-base-plugins/plugins/break-line';

import { pluginExtends } from '../../base';
import { BreakLineSlotPlugin } from './slot';

export * from './slot';

export const BreakLinePlugin = /*#__PURE__*/ pluginExtends(_BreakLinePlugin, {
  slots: [BreakLineSlotPlugin],
});
