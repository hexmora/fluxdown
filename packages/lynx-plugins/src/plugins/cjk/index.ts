import { CjkRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/cjk';

import type { IPluginItem } from '../../typings';

export { CjkRemarkPlugin };

export const CjkPlugin: IPluginItem = __BACKGROUND__
  ? {
      remarks: [CjkRemarkPlugin],
    }
  : {};
