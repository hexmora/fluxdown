import { BlockquotePlugin as _BlockquotePlugin } from '@fluxdown/react-base-plugins/plugins/blockquote';

import { pluginExtends } from '../../base';
import { BlockquoteSlotPlugin } from './slot';

export * from './slot';

export const BlockquotePlugin = /*#__PURE__*/ pluginExtends(_BlockquotePlugin, {
  slots: [BlockquoteSlotPlugin],
});
