import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexRepairPlugin } from '../tex/repair';
import { renderTex } from './repair';
import { TexMathjaxKatexSlotPlugin } from './slot';

export * from './slot';

export const TexMathjaxKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  repairs: [[TexRepairPlugin, { render: renderTex }]],
  slots: [TexMathjaxKatexSlotPlugin],
});
