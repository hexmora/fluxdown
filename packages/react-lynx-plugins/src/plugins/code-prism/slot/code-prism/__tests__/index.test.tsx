import { cleanup, render, waitFor } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { ThemeProvider } from '../../../../../base/theme';
import { DARK_THEME } from '../../../../../base/theme/presets/dark';
import { LIGHT_THEME } from '../../../../../base/theme/presets/light';
import { CodePrismRenderer } from '../renderer';
import * as highlighters from '../renderer/utils';

afterEach(() => {
  cleanup();

  rstest.restoreAllMocks();
});

const content = (dark: boolean) => (
  <ThemeProvider value={dark ? DARK_THEME : LIGHT_THEME}>
    <CodePrismRenderer
      Raw={null}
      code={'const value = 1;\n\n\tvalue;'}
      language="javascript"
      suffix={<text>tail</text>}
    />
  </ThemeProvider>
);

test('renders native tokens with indentation, blank rows, suffix and current theme', async () => {
  const view = render(content(false));

  await waitFor(() => {
    expect(
      [...view.container.querySelectorAll('text')].some((node) =>
        node.getAttribute('style')?.includes('rgb(207, 34, 46)'),
      ),
    ).toBe(true);
  });

  expect(view.container.querySelectorAll('span, pre, code')).toHaveLength(0);

  expect(view.container.textContent).toBe('const value = 1;\u200b  value;tail');

  expect(view.container.querySelectorAll('.fluxdown-code-highlighter > view > text')).toHaveLength(
    3,
  );

  view.rerender(content(true));

  expect(
    [...view.container.querySelectorAll('text')].some((node) =>
      node.getAttribute('style')?.includes('rgb(255, 123, 114)'),
    ),
  ).toBe(true);
});

test('logs failures and falls back to the source as streamed content changes', async () => {
  const error = new Error('Grammar unavailable');

  const log = rstest.spyOn(console, 'error').mockImplementation(() => {});

  rstest.spyOn(highlighters, 'highlightCode').mockRejectedValue(error);

  const view = render(
    <CodePrismRenderer
      Raw={null}
      code="const value = 1;"
      language="javascript"
      suffix={<text>tail</text>}
    />,
  );

  await waitFor(() => expect(log).toHaveBeenCalledWith(error));

  expect(view.container.textContent).toBe('const value = 1;tail');

  view.rerender(<CodePrismRenderer Raw={null} code="next source" language="unknown" />);

  expect(view.container.textContent).toBe('next source');
});
