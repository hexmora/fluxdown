import { pluginExtends } from '../../base/plugins';
import { TexPlugin } from '../tex';
import { TexMathjaxSlotPlugin } from './slot';

export * from './slot';

export const TexMathjaxPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexMathjaxSlotPlugin],
});
