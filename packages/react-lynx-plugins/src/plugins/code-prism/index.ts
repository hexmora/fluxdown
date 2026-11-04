import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base/plugins';
import { CodePlugin } from '../code';
import { CodePrismSlotPlugin } from './slot';

export * from './slot';

export const CodePrismPlugin: IPluginItem = __BACKGROUND__
  ? /*#__PURE__*/ pluginExtends(CodePlugin, {
      slots: [CodePrismSlotPlugin],
    })
  : {};
