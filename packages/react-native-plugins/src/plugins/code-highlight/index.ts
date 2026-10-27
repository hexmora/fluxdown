import { pluginExtends } from '../../base';
import { CodePlugin } from '../code';
import { CodeHighlightSlotPlugin } from './slot';

export * from './slot';

export const CodeHighlightPlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeHighlightSlotPlugin],
});
