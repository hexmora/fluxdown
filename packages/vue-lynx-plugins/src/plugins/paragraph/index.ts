import { pluginExtends } from '@fluxdown/vue-base-plugins/base';
import { ParagraphPlugin as _ParagraphPlugin } from '@fluxdown/vue-base-plugins/plugins/paragraph';

import { ParagraphSlotPlugin } from './slot';

export * from './slot';

export const ParagraphPlugin = /*#__PURE__*/ pluginExtends(_ParagraphPlugin, {
  slots: [ParagraphSlotPlugin],
});
