import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { CodeShikiRenderer } from '../renderer';

afterEach(cleanup);

test('highlights source into native text tokens and retains the streamed suffix', () => {
  const view = render(
    <CodeShikiRenderer
      Raw={null}
      code={'const value = 42;\n  value;'}
      language="typescript"
      suffix={<text>tail</text>}
    />,
  );

  expect(view.container.querySelector('scroll-view')).not.toBeNull();

  expect(view.container.querySelectorAll('span, pre, code').length).toBe(0);

  expect(view.container.textContent).toContain('const value = 42;');

  expect(view.container.textContent).toContain('  value;tail');

  expect(
    [...view.container.querySelectorAll('text')].some((node) =>
      node.getAttribute('style')?.includes('rgb(207, 34, 46)'),
    ),
  ).toBe(true);

  view.rerender(<CodeShikiRenderer Raw={null} code="unknown source" language="unknown-language" />);

  expect(view.container.textContent).toBe('unknown source');
});
