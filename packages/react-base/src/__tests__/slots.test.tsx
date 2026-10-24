import type { AnySlotPluggable, ParagraphProps } from '@fluxdown/react-base-plugins/base';

import { BaseSlotPlugin, pluginExtends } from '@fluxdown/react-base-plugins/base';
import { FallbackPlugin } from '@fluxdown/react-base-plugins/plugins/fallback';
import { ParagraphPlugin } from '@fluxdown/react-base-plugins/plugins/paragraph';
import { render } from '@testing-library/react';

import { FluxdownBase } from '../packs';

class FirstParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph-first';

  readonly Component = ({ children }: ParagraphProps) => <>first:{children}</>;

  readonly type = 'Paragraph';
}

class SecondParagraphSlotPlugin extends BaseSlotPlugin<'Paragraph'> {
  static readonly key = 'test-paragraph-second';

  readonly Component = ({ children }: ParagraphProps) => <>second:{children}</>;

  readonly type = 'Paragraph';
}

test.each(['single', 'array'] as const)(
  'updates, disables, and removes slots independently of text in %s plugin packs',
  (type) => {
    const getPlugins = (slots: AnySlotPluggable[]) => {
      if (type === 'single') {
        return pluginExtends(ParagraphPlugin, FallbackPlugin, { slots });
      }

      return [ParagraphPlugin, FallbackPlugin, { slots }];
    };

    const view = render(
      <FluxdownBase plugins={getPlugins([FirstParagraphSlotPlugin])} text="hello" />,
    );

    expect(view.container).toHaveTextContent(/^first:hello$/);

    view.rerender(<FluxdownBase plugins={getPlugins([SecondParagraphSlotPlugin])} text="hello" />);

    expect(view.container).toHaveTextContent(/^second:hello$/);

    view.rerender(
      <FluxdownBase
        plugins={getPlugins([[SecondParagraphSlotPlugin, { disabled: true }]])}
        text="hello"
      />,
    );

    expect(view.container).toBeEmptyDOMElement();

    view.rerender(<FluxdownBase plugins={getPlugins([FirstParagraphSlotPlugin])} text="hello" />);

    expect(view.container).toHaveTextContent(/^first:hello$/);

    view.rerender(<FluxdownBase plugins={getPlugins([])} text="hello" />);

    expect(view.container).toBeEmptyDOMElement();
  },
);
