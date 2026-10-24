import type { ReactRenderParams } from '@fluxdown/react-base-plugins/base';

import { BaseReactRenderPlugin } from '@fluxdown/react-base-plugins/base';
import { render, waitFor } from '@testing-library/react';

import { FluxdownBase } from '../packs';

class LinkRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'test-link';

  match() {
    return true;
  }

  render({ getProps, node, renderChildren }: ReactRenderParams) {
    if (node.type === 'text') {
      return node.value;
    }

    if (node.type === 'element' && node.tagName === 'a') {
      return [String(getProps().href ?? ''), renderChildren()];
    }

    return renderChildren();
  }
}

test('updates property conversion independently of unchanged text and plugins', () => {
  const plugins = { renders: [LinkRenderPlugin] };
  const text = '[content](https://example.com)';

  const view = render(<FluxdownBase plugins={plugins} text={text} />);

  expect(view.container).toHaveTextContent(/^https:\/\/example\.comcontent$/);

  view.rerender(<FluxdownBase plugins={plugins} text={text} getProps={null} />);

  expect(view.container).toHaveTextContent(/^content$/);

  view.rerender(
    <FluxdownBase
      plugins={plugins}
      text={text}
      getProps={(node) => ({ href: `custom:${node?.tagName}:` })}
    />,
  );

  expect(view.container).toHaveTextContent(/^custom:a:content$/);

  view.rerender(<FluxdownBase plugins={plugins} text={text} />);

  expect(view.container).toHaveTextContent(/^https:\/\/example\.comcontent$/);
});

test('uses the latest property converter on the next content update', async () => {
  const plugins = { renders: [LinkRenderPlugin] };
  const text = '[content](https://example.com)';
  const first = jest.fn(() => ({ href: 'first:' }));
  const second = jest.fn(() => ({ href: 'second:' }));
  const view = render(<FluxdownBase plugins={plugins} text={text} getProps={first} />);

  expect(view.container).toHaveTextContent(/^first:content$/);

  view.rerender(<FluxdownBase plugins={plugins} text={text} getProps={second} />);

  expect(second).not.toHaveBeenCalled();

  view.rerender(
    <FluxdownBase plugins={plugins} text="[updated](https://example.com)" getProps={second} />,
  );

  await waitFor(() => {
    expect(view.container).toHaveTextContent(/^second:updated$/);
  });
});
