import { pluginExtends } from '@fluxdown/angular-plugins/base';
import { TexPlugin } from '@fluxdown/angular-plugins/plugins/tex';

import { TexMathjaxKatexSlotPlugin } from './slot';

export * from './slot';

export const TexMathjaxKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexMathjaxKatexSlotPlugin],
});
