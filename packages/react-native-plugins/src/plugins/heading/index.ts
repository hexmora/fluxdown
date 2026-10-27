import { HeadingPlugin as _HeadingPlugin } from '@fluxdown/react-base-plugins/plugins/heading';

import { pluginExtends } from '../../base';
import { HeadingSlotPlugin } from './slot';

export * from './slot';

export const HeadingPlugin = /*#__PURE__*/ pluginExtends(_HeadingPlugin, {
  slots: [HeadingSlotPlugin],
});
