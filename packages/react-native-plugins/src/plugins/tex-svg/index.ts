import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexSvgSlotPlugin } from './slot';

export * from './slot';

export const TexSvgPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexSvgSlotPlugin],
});
