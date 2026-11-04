import type { IPluginItem } from '@fluxdown/vue-base-plugins/typings';

import { pluginExtends } from '@fluxdown/vue-base-plugins/base';

import { TexPlugin } from '../tex';
import { TexMathJaxSlotPlugin } from './slot';

export * from './slot';

export const TexMathJaxPlugin: IPluginItem = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexMathJaxSlotPlugin],
});
