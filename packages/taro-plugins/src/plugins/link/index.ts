import { LinkPlugin as _LinkPlugin } from '@fluxdown/react-base-plugins/plugins/link';

import { pluginExtends } from '../../base';
import { LinkSlotPlugin } from './slot';

export * from './slot';

export const LinkPlugin = /*#__PURE__*/ pluginExtends(_LinkPlugin, {
  slots: [LinkSlotPlugin],
});
