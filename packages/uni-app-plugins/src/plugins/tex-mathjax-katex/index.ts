import { pluginExtends } from '../../base/plugins';
import { TexPlugin } from '../tex';
import { TexMathjaxKatexSlotPlugin } from './slot';

export * from './slot';

export const TexMathjaxKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexMathjaxKatexSlotPlugin],
});
