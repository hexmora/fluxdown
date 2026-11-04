// @vitest-environment node

import type {
  ParagraphProps,
  VueRenderMatchParams,
  VueRenderParams,
} from '@fluxdown/vue-base-plugins/base';

import { BaseSlotPlugin, BaseVueRenderPlugin } from '@fluxdown/vue-base-plugins/base';
import { ParagraphPlugin } from '@fluxdown/vue-base-plugins/plugins/paragraph';
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';

import { FluxdownBase } from '../packs';

class TextRenderer extends BaseVueRenderPlugin {
  static readonly key = 'test-text';

  match({ node }: VueRenderMatchParams) {
    return node.type === 'text';
  }

  render({ node }: VueRenderParams) {
    return node.type === 'text' ? node.value : null;
  }
}

class ParagraphSlot extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph';

  readonly type = 'Paragraph';

  readonly Component = ({ children }: ParagraphProps) => <>paragraph:{children}</>;
}

test('composes semantic plugins and custom slots without a host wrapper on the server', async () => {
  const app = createSSRApp(() =>
    h(FluxdownBase, {
      plugins: [ParagraphPlugin, { renders: [TextRenderer], slots: [ParagraphSlot] }],
      text: 'content',
    }),
  );

  const markup = (await renderToString(app)).replace(/<!--[\s\S]*?-->/g, '');

  expect(markup).toBe('paragraph:content');
});
