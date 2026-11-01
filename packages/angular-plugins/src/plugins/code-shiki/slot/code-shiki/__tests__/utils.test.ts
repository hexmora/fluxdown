import { highlightCode } from '../renderer/utils';

describe('Shiki highlighting', () => {
  test('preserves text and uses theme variables in tokens', async () => {
    const code = 'const message = "hello";';

    const tokens = await highlightCode(code, 'javascript');

    expect(
      tokens
        ?.flat()
        .map((token) => token.content)
        .join(''),
    ).toBe(code);

    expect(tokens?.flat().some((token) => token.color?.startsWith('var(--'))).toBe(true);
  });

  test.each(['__proto__', 'constructor', 'unknown'])('falls back for %s', async (language) => {
    await expect(highlightCode('content', language)).resolves.toBeNull();
  });

  test('does not publish canceled highlights', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(
      highlightCode('const value = 42;', 'javascript', controller.signal),
    ).resolves.toBeNull();
  });
});
