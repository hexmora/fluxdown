import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base';
import { TexPlugin } from '../tex';
import { TexMathJaxSlotPlugin } from './slot';

export * from './slot';

export const TexMathJaxPlugin: IPluginItem = __BACKGROUND__
  ? /*#__PURE__*/ pluginExtends(TexPlugin, { slots: [TexMathJaxSlotPlugin] })
  : {};
