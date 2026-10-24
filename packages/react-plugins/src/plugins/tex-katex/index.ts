import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexKatexSlotPlugin } from './slot';

export * from './slot';

export const TexKatexPlugin = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexKatexSlotPlugin],
});
