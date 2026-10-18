import type { ThemeRegistrationRaw } from 'shiki/core';

import { highlightCode } from '../utils';

const theme: ThemeRegistrationRaw = {
  name: 'test',
  settings: [
    { settings: { foreground: '#202123', background: '#ffffff' } },
    { scope: ['keyword', 'storage'], settings: { foreground: '#cf222e' } },
    { scope: 'constant', settings: { foreground: '#0550ae' } },
  ],
};

describe('code highlighting', () => {
  test('loads language aliases and preserves source text', async () => {
    const source = 'const answer: number = 42;';

    const tokens = await highlightCode(source, 'TS', theme);

    expect(
      tokens
        ?.flat()
        .map((token) => token.content)
        .join(''),
    ).toBe(source);

    expect(tokens?.flat().some((token) => token.color === '#CF222E')).toBe(true);

    expect(tokens?.flat().some((token) => token.color === '#0550AE')).toBe(true);
  });

  test('keeps unknown and prototype property languages as plaintext', async () => {
    expect(await highlightCode('<script>source</script>', 'unknown-language', theme)).toBeNull();

    expect(await highlightCode('value', '__proto__', theme)).toBeNull();

    expect(await highlightCode('value', 'plaintext', theme)).toBeNull();
  });

  test('shares concurrent language loads', async () => {
    const [first, second] = await Promise.all([
      highlightCode('answer = 42', 'python', theme),
      highlightCode('answer = 43', 'python', theme),
    ]);

    expect(
      first
        ?.flat()
        .map((token) => token.content)
        .join(''),
    ).toBe('answer = 42');

    expect(
      second
        ?.flat()
        .map((token) => token.content)
        .join(''),
    ).toBe('answer = 43');
  });

  test('keeps concurrent same-name themes isolated and can switch back to a previous theme', async () => {
    const alternative: ThemeRegistrationRaw = {
      name: theme.name,
      settings: [
        { settings: { foreground: '#ececf1', background: '#212121' } },
        { scope: ['keyword', 'storage'], settings: { foreground: '#ff7b72' } },
      ],
    };

    const [light, dark] = await Promise.all([
      highlightCode('const value = 1', 'js', theme),
      highlightCode('const value = 1', 'js', alternative),
    ]);

    const restored = await highlightCode('const value = 2', 'js', theme);

    expect(light?.flat().find((token) => token.content === 'const')?.color).toBe('#CF222E');

    expect(dark?.flat().find((token) => token.content === 'const')?.color).toBe('#FF7B72');

    expect(restored?.flat().find((token) => token.content === 'const')?.color).toBe('#CF222E');
  });
});
