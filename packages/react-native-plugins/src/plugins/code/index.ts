import { CodePlugin as _CodePlugin } from '@fluxdown/react-base-plugins/plugins/code';

import { pluginExtends } from '../../base';
import { CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin } from './slot';

export * from './slot';

export const CodePlugin = /*#__PURE__*/ pluginExtends(_CodePlugin, {
  slots: [CodeBlockSlotPlugin, CodeHeaderSlotPlugin, CodeHighlighterSlotPlugin],
});
