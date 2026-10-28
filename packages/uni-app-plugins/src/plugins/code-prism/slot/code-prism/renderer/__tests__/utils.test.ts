import { highlight, toCodeLines } from '../utils';

describe('Prism tokens', () => {
  test('preserves all whitespace and source characters', () => {
    const code = 'const answer = 42;\n  console.log("hello");';

    const tokens = highlight(code, 'javascript');

    expect(tokens.map((token) => token.text).join('')).toBe(code);

    expect(tokens.some((token) => token.type === 'keyword')).toBe(true);
  });

  test('falls back to plain text for unregistered languages', () => {
    expect(highlight('<script>alert(1)</script>', 'unknown')).toEqual([
      { text: '<script>alert(1)</script>' },
    ]);
  });
});

test('keeps token colors within the original code lines, including blank lines', () => {
  const code = 'function sum() {\n\n  return 42;\n}';

  const lines = toCodeLines(highlight(code, 'javascript'));

  expect(lines.map((line) => line.map((token) => token.text).join(''))).toEqual(code.split('\n'));

  expect(lines).toHaveLength(4);

  expect(lines[1]).toEqual([]);
});
