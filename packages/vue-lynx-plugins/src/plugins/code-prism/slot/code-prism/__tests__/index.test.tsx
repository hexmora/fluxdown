import { flushPromises, mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';

import { ThemeProvider } from '../../../../../base/theme';
import { DARK_THEME } from '../../../../../base/theme/presets/dark';
import { LIGHT_THEME } from '../../../../../base/theme/presets/light';
import { CodePrismRenderer } from '../renderer';
import * as highlighters from '../renderer/utils';

test('renders native tokens with indentation, blank rows, suffix and current theme', async () => {
  const code = 'const value = 1;\n\n\tvalue;';

  const view = mount(ThemeProvider, {
    props: { value: LIGHT_THEME },
    slots: {
      default: () => (
        <CodePrismRenderer Raw={null} code={code} language="javascript" suffix="tail" />
      ),
    },
  });

  await highlighters.highlightCode(code, 'javascript');

  await flushPromises();

  expect(view.findAll('span, pre, code')).toHaveLength(0);

  expect(view.get('.fluxdown-code-highlighter').text()).toBe('const value = 1;\u200b  value;tail');

  expect(view.findAll('.fluxdown-code-highlighter > view > text')).toHaveLength(3);

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(207, 34, 46)')),
  ).toBe(true);

  await view.setProps({ value: DARK_THEME });

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(255, 123, 114)')),
  ).toBe(true);
});

test('logs failures and falls back to the source as streamed content changes', async () => {
  const error = new Error('Grammar unavailable');

  const log = vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.spyOn(highlighters, 'highlightCode').mockRejectedValue(error);

  const view = mount(CodePrismRenderer, {
    props: { Raw: null, code: 'const value = 1;', language: 'javascript', suffix: 'tail' },
  });

  await flushPromises();

  expect(log).toHaveBeenCalledWith(error);

  expect(view.text()).toBe('const value = 1;tail');

  await view.setProps({ code: 'next source', language: 'unknown' });

  expect(view.text()).toBe('next sourcetail');
});
