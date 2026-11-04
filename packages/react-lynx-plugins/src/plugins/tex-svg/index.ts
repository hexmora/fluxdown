import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexSvgSlotPlugin } from './slot';

export * from './slot';

export const TexSvgPlugin: IPluginItem = __BACKGROUND__
  ? /*#__PURE__*/ pluginExtends(TexPlugin, { slots: [TexSvgSlotPlugin] })
  : {};
