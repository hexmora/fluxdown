import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base';
import { CodeHighlighterSlotPlugin as CodeShikiSlotPlugin } from '../../slot/code-highlighter';
import { CodePlugin } from '../code';

export { CodeShikiSlotPlugin };

export const CodeShikiPlugin: IPluginItem = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeShikiSlotPlugin],
});
