import { pluginExtends } from '@fluxdown/angular-plugins/base';
import { TexPlugin } from '@fluxdown/angular-plugins/plugins/tex';

import { TexKatexSlotPlugin } from './slot';

export * from './slot';

export const TexKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexKatexSlotPlugin],
});
