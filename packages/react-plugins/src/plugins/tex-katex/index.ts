import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexRepairPlugin } from '../tex/repair';
import { katexTexToHtml } from './engine';
import { TexKatexSlotPlugin } from './slot';

export * from './slot';

export const TexKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  repairs: [[TexRepairPlugin, { render: katexTexToHtml }]],
  slots: [TexKatexSlotPlugin],
});
