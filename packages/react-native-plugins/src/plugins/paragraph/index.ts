import { ParagraphPlugin as _ParagraphPlugin } from '@fluxdown/react-base-plugins/plugins/paragraph';

import { pluginExtends } from '../../base';
import { ParagraphSlotPlugin } from './slot';

export * from './slot';

export const ParagraphPlugin = /*#__PURE__*/ pluginExtends(_ParagraphPlugin, {
  slots: [ParagraphSlotPlugin],
});
