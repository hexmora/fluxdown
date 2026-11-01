import type { IPluginItem } from '@fluxdown/angular-plugins/typings';

import { EmojiRemarkPlugin } from '@fluxdown/core-plugins/plugins/remark/emoji';

export { EmojiRemarkPlugin };

export const EmojiPlugin: IPluginItem = {
  remarks: [EmojiRemarkPlugin],
};
