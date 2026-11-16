import type { RepairPluginRunner } from '@fluxdown/types';

import { BaseRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/base';

export class StreamingIndicatorRepairPlugin extends BaseRepairPlugin {
  static readonly key = 'repair-streaming-indicator';

  override readonly config = { ending: true, allows: 'root' };

  override runner: RepairPluginRunner = ({ node, break: stop }) => {
    if (node.type !== 'root' || !('children' in node)) {
      return;
    }

    node.children.push({
      type: 'paragraph',
      children: [{ type: 'text', value: '…' }],
    });

    stop();
  };
}
