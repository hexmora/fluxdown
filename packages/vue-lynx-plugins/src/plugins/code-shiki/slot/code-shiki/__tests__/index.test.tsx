import { flushPromises, mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';

import { ThemeProvider } from '../../../../../base/theme';
import { DARK_THEME } from '../../../../../base/theme/presets/dark';
import { LIGHT_THEME } from '../../../../../base/theme/presets/light';
import { CodeShikiRenderer } from '../renderer';
import * as highlighters from '../renderer/utils';
import { createCodeHighlighter } from '../renderer/utils';

test('preserves native code rows, suffix position, syntax color, and caller attributes', async () => {
  const view = mount(CodeShikiRenderer, {
    props: {
      Raw: null,
      code: 'const value = 1;\nconsole.log(value);',
      language: 'javascript',
      suffix: '▌',
      class: 'custom-code',
    },
    attrs: { id: 'code-example', 'data-example': 'javascript' },
  });

  await createCodeHighlighter();

  await flushPromises();

  const root = view.get('.fluxdown-code-highlighter');

  expect(root.attributes('id')).toBe('code-example');

  expect(root.attributes('data-example')).toBe('javascript');

  expect(root.classes()).toContain('custom-code');

  expect(root.text()).toBe('const value = 1;console.log(value);▌');

  expect(root.findAll(':scope > view > text')).toHaveLength(2);

  expect(
    root.findAll('text').some((node) => node.attributes('style')?.includes('rgb(207, 34, 46)')),
  ).toBe(true);

  await view.setProps({ code: 'plain\ttext', language: 'unknown' });

  expect(root.text()).toBe('plain  text▌');

  expect(root.findAll(':scope > view > text')).toHaveLength(1);
});

test('uses the current theme when a pending highlighter finishes loading', async () => {
  const highlighter = await createCodeHighlighter();

  let finish!: () => void;

  vi.spyOn(highlighters, 'createCodeHighlighter').mockReturnValue(
    new Promise((resolve) => {
      finish = () => resolve(highlighter);
    }),
  );

  const view = mount(ThemeProvider, {
    props: { value: LIGHT_THEME },
    slots: {
      default: () => <CodeShikiRenderer Raw={null} code="const value = 1;" language="javascript" />,
    },
  });

  await view.setProps({ value: DARK_THEME });

  finish();

  await flushPromises();

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(255, 123, 114)')),
  ).toBe(true);

  await view.setProps({ value: LIGHT_THEME });

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(207, 34, 46)')),
  ).toBe(true);
});

test('logs initialization errors and preserves the source without highlighting', async () => {
  const error = new Error('highlighter initialization failed');

  const log = vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.spyOn(highlighters, 'createCodeHighlighter').mockRejectedValue(error);

  const view = mount(CodeShikiRenderer, {
    props: { Raw: null, code: 'const value = 1;', language: 'javascript' },
  });

  await flushPromises();

  expect(log).toHaveBeenCalledWith(error);

  expect(view.get('.fluxdown-code-highlighter').text()).toBe('const value = 1;');

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(207, 34, 46)')),
  ).toBe(false);
});

test('logs tokenization errors and preserves the source without highlighting', async () => {
  const highlighter = await createCodeHighlighter();

  const error = new Error('tokenization failed');

  const log = vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.spyOn(highlighter, 'codeToTokens').mockImplementation(() => {
    throw error;
  });

  const view = mount(CodeShikiRenderer, {
    props: { Raw: null, code: 'const value = 1;', language: 'javascript' },
  });

  await flushPromises();

  expect(log).toHaveBeenCalledWith(error);

  expect(view.get('.fluxdown-code-highlighter').text()).toBe('const value = 1;');

  expect(
    view.findAll('text').some((node) => node.attributes('style')?.includes('rgb(207, 34, 46)')),
  ).toBe(false);
});
