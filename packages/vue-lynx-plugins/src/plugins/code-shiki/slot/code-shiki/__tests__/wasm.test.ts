import { afterEach, expect, test, vi } from 'vitest';

import { LIGHT_THEME } from '../../../../../base/theme/presets/light';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('highlights with the native Module/Instance API when static Wasm APIs and atob are absent', async () => {
  vi.stubGlobal('WebAssembly', {
    Module: WebAssembly.Module,
    Instance: WebAssembly.Instance,
  });

  vi.stubGlobal('atob', undefined);

  const { createCodeHighlighter, createCodeTheme } = await import('../renderer/utils');

  const highlighter = await createCodeHighlighter();

  const source = 'const 名称 = "内容";';

  const lines = highlighter.codeToTokens(source, {
    lang: 'javascript',
    theme: createCodeTheme(LIGHT_THEME.tokens),
  }).tokens;

  expect(
    lines
      .flat()
      .map((token) => token.content)
      .join(''),
  ).toBe(source);

  expect(
    lines
      .flat()
      .find((token) => token.content === 'const')
      ?.color?.toLowerCase(),
  ).toBe(LIGHT_THEME.tokens.syntax.keyword);

  expect(
    lines.flat().some((token) => token.color?.toLowerCase() === LIGHT_THEME.tokens.syntax.string),
  ).toBe(true);

  expect(globalThis.atob).toBeTypeOf('function');
});
