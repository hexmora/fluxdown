import { pluginExtends } from '@fluxdown/angular-plugins/base';
import { CodePlugin } from '@fluxdown/angular-plugins/plugins/code';

import { CodeShikiSlotPlugin } from './slot';

export * from './slot';

export const CodeShikiPlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeShikiSlotPlugin],
});
