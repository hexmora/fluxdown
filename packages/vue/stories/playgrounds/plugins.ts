import type { CodeBlockProps } from '@fluxdown/vue-plugins/base';
import type { IPluginItem } from '@fluxdown/vue-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/vue-plugins/base';
import { h } from 'vue';

function CompactCodeBlock({ Raw, ...props }: CodeBlockProps) {
  return Raw ? h(Raw, { ...props, showHeader: false }) : null;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

export const CompactCodePlugin: IPluginItem = {
  slots: [CompactCodeBlockPlugin],
};
