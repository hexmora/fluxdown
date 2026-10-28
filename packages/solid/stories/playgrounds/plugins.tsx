import type { CodeBlockProps } from '@fluxdown/solid-plugins/base';
import type { IPluginItem } from '@fluxdown/solid-plugins/typings';

import { BaseSlotPlugin } from '@fluxdown/solid-plugins/base';
import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

function CompactCodeBlock(props: CodeBlockProps) {
  const [local, rest] = splitProps(props, ['Raw']);

  return <Dynamic component={local.Raw ?? undefined} {...rest} showHeader={false} />;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

export const CompactCodePlugin: IPluginItem = {
  slots: [CompactCodeBlockPlugin],
};
