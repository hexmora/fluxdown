import { StrongPlugin as _StrongPlugin } from '@fluxdown/react-base-plugins/plugins/strong';

import { pluginExtends } from '../../base';
import { StrongSlotPlugin } from './slot';

export * from './slot';

export const StrongPlugin = /*#__PURE__*/ pluginExtends(_StrongPlugin, {
  slots: [StrongSlotPlugin],
});
