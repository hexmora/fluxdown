/** @jest-environment node */

import type { ParagraphProps } from '@fluxdown/react-base-plugins/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-plugins/base';
import { FallbackPlugin } from '@fluxdown/react-base-plugins/plugins/fallback';
import { ParagraphPlugin } from '@fluxdown/react-base-plugins/plugins/paragraph';
import { renderToStaticMarkup } from 'react-dom/server';

import { FluxdownBase } from '../packs';

class NativeParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'native-paragraph';

  readonly Component = ({ children }: ParagraphProps) => <>paragraph:{children}</>;

  readonly type = 'Paragraph';
}

test('composes semantic plugins with a host-independent slot without a DOM wrapper', () => {
  const output = renderToStaticMarkup(
    <FluxdownBase
      plugins={[ParagraphPlugin, FallbackPlugin, { slots: [NativeParagraphSlotPlugin] }]}
      text="hello"
    />,
  );

  expect(output).toBe('paragraph:hello');
});
