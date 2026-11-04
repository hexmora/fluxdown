import { describe, expect, test } from '@rstest/core';

import { LIGHT_THEME } from '../../../../../base/theme/presets/light';
import { highlightCode, tokenStyle } from '../renderer/utils';

describe('native Prism highlighting', () => {
  test('preserves rows, blank lines, indentation and multiline tokens', async () => {
    const code = '/* first\nsecond */\n\n\tconst value = 1;\n';

    const lines = await highlightCode(code, 'javascript');

    expect(lines).toHaveLength(5);

    expect(lines!.map((line) => line.map((token) => token.content).join('')).join('\n')).toBe(
      code.replace(/\t/g, '  '),
    );

    expect(lines![0].every((token) => token.types.includes('comment'))).toBe(true);

    expect(lines![1].every((token) => token.types.includes('comment'))).toBe(true);

    expect(lines![3].find((token) => token.content === 'const')?.types).toContain('keyword');
  });

  test('loads the same language components and hooks as the DOM plugin', async () => {
    const python = await highlightCode('def square(x):\n  return x * x', 'python');

    expect(python?.flat().find((token) => token.content === 'def')?.types).toContain('keyword');

    const jsx = await highlightCode('const element = <div>{value}</div>;', 'jsx');

    expect(
      jsx
        ?.flat()
        .map((token) => token.content)
        .join(''),
    ).toBe('const element = <div>{value}</div>;');

    expect(jsx?.flat().some((token) => token.types.includes('tag'))).toBe(true);
  });

  test('keeps unsupported languages readable and maps inherited token styles', async () => {
    expect(await highlightCode('plain <source>', 'unknown')).toBeNull();

    expect(await highlightCode('plain <source>', 'plaintext')).toBeNull();

    expect(tokenStyle(['string', 'bold', 'keyword', 'italic'], LIGHT_THEME.tokens)).toEqual({
      color: LIGHT_THEME.tokens.syntax.keyword,
      fontWeight: '700',
      fontStyle: 'italic',
    });
  });
});
