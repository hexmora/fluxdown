import { TexPlugin as _TexPlugin } from '@fluxdown/react-base-plugins/plugins/tex';

import { pluginExtends } from '../../base';
import { TexSlotPlugin } from './slot';

export * from './slot';

export const TexPlugin = /*#__PURE__*/ pluginExtends(_TexPlugin, {
  slots: [TexSlotPlugin],
});
