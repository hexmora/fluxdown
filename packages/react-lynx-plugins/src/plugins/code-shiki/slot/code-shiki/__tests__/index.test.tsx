import { act, cleanup, render, waitFor } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { ThemeProvider } from '../../../../../base/theme';
import { DARK_THEME } from '../../../../../base/theme/presets/dark';
import { LIGHT_THEME } from '../../../../../base/theme/presets/light';
import { CodeShikiRenderer } from '../renderer';
import * as highlighters from '../renderer/utils';

afterEach(() => {
  cleanup();

  rstest.restoreAllMocks();
});

test('highlights source into native text tokens and retains the streamed suffix', async () => {
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

  await waitFor(() => {
    expect(
      [...view.container.querySelectorAll('text')].some((node) =>
        node.getAttribute('style')?.includes('rgb(207, 34, 46)'),
      ),
    ).toBe(true);
  });

  view.rerender(<CodeShikiRenderer Raw={null} code="unknown source" language="unknown-language" />);

  expect(view.container.textContent).toBe('unknown source');
});

test('uses the current theme when a pending highlighter finishes loading', async () => {
  const highlighter = await highlighters.createCodeHighlighter();

  let finish!: () => void;

  rstest.spyOn(highlighters, 'createCodeHighlighter').mockReturnValue(
    new Promise((resolve) => {
      finish = () => resolve(highlighter);
    }),
  );

  const view = render(
    <ThemeProvider value={LIGHT_THEME}>
      <CodeShikiRenderer Raw={null} code="const value = 1;" language="javascript" />
    </ThemeProvider>,
  );

  view.rerender(
    <ThemeProvider value={DARK_THEME}>
      <CodeShikiRenderer Raw={null} code="const value = 1;" language="javascript" />
    </ThemeProvider>,
  );

  await act(async () => finish());

  expect(
    [...view.container.querySelectorAll('text')].some((node) =>
      node.getAttribute('style')?.includes('rgb(255, 123, 114)'),
    ),
  ).toBe(true);
});

test('keeps source and the streamed suffix readable when initialization fails', async () => {
  const error = new Error('Highlighter unavailable');

  const log = rstest.spyOn(console, 'error').mockImplementation(() => {});

  rstest.spyOn(highlighters, 'createCodeHighlighter').mockRejectedValue(error);

  const view = render(
    <CodeShikiRenderer
      Raw={null}
      code={'const value = 42;\n\tvalue;'}
      language="javascript"
      suffix={<text>tail</text>}
    />,
  );

  await waitFor(() => expect(log).toHaveBeenCalledWith(error));

  expect(view.container.textContent).toBe('const value = 42;  value;tail');

  view.rerender(<CodeShikiRenderer Raw={null} code="next source" language="javascript" />);

  expect(view.container.textContent).toBe('next source');
});

test('falls back to source when tokenization fails', async () => {
  const highlighter = await highlighters.createCodeHighlighter();

  const error = new Error('Grammar unavailable');

  const log = rstest.spyOn(console, 'error').mockImplementation(() => {});

  rstest.spyOn(highlighter, 'codeToTokens').mockImplementation(() => {
    throw error;
  });

  const view = render(
    <CodeShikiRenderer Raw={null} code="const value = 42;" language="javascript" />,
  );

  await waitFor(() => expect(log).toHaveBeenCalledWith(error));

  expect(view.container.textContent).toBe('const value = 42;');
});
