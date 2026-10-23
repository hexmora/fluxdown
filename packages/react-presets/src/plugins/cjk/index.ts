import { CjkRemarkPlugin } from '@fluxdown/core-presets/plugins/remark/cjk';

import type { IPluginItem } from '../../typings';

export { CjkRemarkPlugin };

export const CjkPlugin: IPluginItem = {
  remarks: [CjkRemarkPlugin],
};
