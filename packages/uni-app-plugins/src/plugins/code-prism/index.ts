import { pluginExtends } from '../../base/plugins';
import { CodePlugin } from '../code';
import { CodePrismSlotPlugin } from './slot';

export * from './slot';

export const CodePrismPlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodePrismSlotPlugin],
});
