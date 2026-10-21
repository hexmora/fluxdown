import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base';
import { TexSlotPlugin as TexMathjaxSlotPlugin } from '../../slot/tex';
import { TexPlugin } from '../tex';

export { TexMathjaxSlotPlugin };

export const TexMathjaxPlugin: IPluginItem = /*#__PURE__*/ pluginExtends(TexPlugin, {
  slots: [TexMathjaxSlotPlugin],
});
