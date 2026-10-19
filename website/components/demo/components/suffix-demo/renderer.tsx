import type { ReactRenderMatchParams, ReactRenderParams } from '@fluxdown/react-presets/base';

import { isSuffixNode, SUFFIX_DATA_ATTR } from '@fluxdown/core-presets/mapper';
import { BaseReactRenderPlugin } from '@fluxdown/react-presets/base';
import { SuffixRenderer } from '@fluxdown/react-presets/plugins/effect-suffix';

export class SmileRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-demo-smile';

  match({ node }: ReactRenderMatchParams) {
    return isSuffixNode(node) && node.properties[SUFFIX_DATA_ATTR] === 'smile';
  }

  render({ node }: ReactRenderParams) {
    if (!isSuffixNode(node) || node.properties[SUFFIX_DATA_ATTR] !== 'smile') {
      return null;
    }

    return <SuffixRenderer type="smile">🙂</SuffixRenderer>;
  }
}
