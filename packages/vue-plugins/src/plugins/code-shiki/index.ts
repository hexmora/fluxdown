import { pluginExtends } from '@fluxdown/vue-base-plugins/base';

import { CodePlugin } from '../code';
import { CodeShikiSlotPlugin } from './slot';

export * from './slot';

export const CodeShikiPlugin = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodeShikiSlotPlugin],
});
