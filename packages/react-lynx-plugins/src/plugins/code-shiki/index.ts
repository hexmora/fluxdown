import type { IPluginItem } from '../../typings';

import { pluginExtends } from '../../base/plugins';
import { CodePlugin } from '../code';
import { CodeShikiSlotPlugin } from './slot';

export * from './slot';

export const CodeShikiPlugin: IPluginItem = __BACKGROUND__
  ? /*#__PURE__*/ pluginExtends(CodePlugin, {
      slots: [CodeShikiSlotPlugin],
    })
  : {};
