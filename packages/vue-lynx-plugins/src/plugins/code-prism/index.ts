import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { pluginExtends } from '@fluxdown/vue-base-plugins/base';

import { CodePlugin } from '../code';
import { CodePrismSlotPlugin } from './slot';

export * from './slot';

export const CodePrismPlugin: IPluginItem = /*#__PURE__*/ pluginExtends(CodePlugin, {
  slots: [CodePrismSlotPlugin],
});
