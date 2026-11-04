import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/uni-app-plugins/base';

import { Quote } from './components/quote';

class QuoteSlotPlugin extends BaseSlotPlugin<'Blockquote'> {
  static readonly key = 'slot-preview-quote';

  readonly type = 'Blockquote';

  readonly Component = Quote;
}

export const QuotePlugin: IPluginItem = {
  slots: [QuoteSlotPlugin],
};
