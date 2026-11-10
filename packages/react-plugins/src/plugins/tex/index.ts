import { TexPlugin as _TexPlugin } from '@fluxdown/react-base-plugins/plugins/tex';

import { pluginExtends } from '../../base';
import { TexRepairPlugin } from './repair';
import { TexSlotPlugin } from './slot';

export * from './repair';
export * from './slot';

export const TexPlugin = /*#__PURE__*/ pluginExtends(_TexPlugin, {
  repairs: [[TexRepairPlugin, { disabled: true }]],
  slots: [TexSlotPlugin],
});
