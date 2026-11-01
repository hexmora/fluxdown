import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { CjkRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/cjk';

export { CjkRemarkPlugin };

export const CjkPlugin: IPluginItem = {
  remarks: [CjkRemarkPlugin],
};
