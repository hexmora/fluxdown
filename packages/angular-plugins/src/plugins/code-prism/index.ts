import { pluginExtends } from '@fluxdown/angular-plugins/base';
import { CodePlugin } from '@fluxdown/angular-plugins/plugins/code';

import { CodePrismSlotPlugin } from './slot';

export * from './slot';

export const CodePrismPlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodePrismSlotPlugin],
});
