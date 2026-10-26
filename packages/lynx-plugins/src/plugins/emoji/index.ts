import { EmojiRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/emoji';

import type { IPluginItem } from '../../typings';

export { EmojiRemarkPlugin };

export const EmojiPlugin: IPluginItem = __BACKGROUND__
  ? {
      remarks: [EmojiRemarkPlugin],
    }
  : {};
