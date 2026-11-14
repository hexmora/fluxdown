import { getTexStreamEnd, TexPrefixParser } from '../prefix';

describe('longest accepted TeX prefix', () => {
  test('handles non-monotone validity without rechecking old endpoints', () => {
    const accepted = new Set(['a', 'a+b', 'a+b+c']);
    const check = jest.fn((source: string) => accepted.has(source));
    const parser = new TexPrefixParser((source) => (check(source) ? source : null));

    expect(parser.parse('a').tex.length).toBe(1);
    expect(parser.parse('a+').tex.length).toBe(1);
    expect(parser.parse('a+b').tex.length).toBe(3);
    expect(parser.parse('a+b+').tex.length).toBe(3);
    expect(parser.parse('a+b+c').tex.length).toBe(5);
    expect(parser.parse('a+b+c').tex.length).toBe(5);
    expect(check.mock.calls.map(([source]) => source)).toEqual(['a', 'a+', 'a+b', 'a+b+', 'a+b+c']);
  });

  test('checks skipped endpoints of a new chunk from longest to shortest', () => {
    const check = jest.fn((source: string) => source === 'ok');
    const parser = new TexPrefixParser((source) => (check(source) ? source : null));

    expect(parser.parse('ok???').tex.length).toBe(2);
    expect(parser.parse('ok??????').tex.length).toBe(2);
    expect(check).toHaveBeenCalledTimes(7);
  });

  test('invalidates its checkpoint after replacement or truncation', () => {
    const parser = new TexPrefixParser((source) =>
      source === 'abc' || source === 'x' ? source : null,
    );

    expect(parser.parse('abc?').tex.length).toBe(3);
    expect(parser.parse('ab').tex.length).toBe(0);
    expect(parser.parse('x?').tex.length).toBe(1);
    expect(parser.parse('').tex.length).toBe(0);
  });

  test('matches an exhaustive oracle for every acceptance pattern and chunk size', () => {
    const source = 'abcdefgh';

    for (let mask = 0; mask < 256; mask += 1) {
      for (let chunk = 1; chunk <= source.length; chunk += 1) {
        const accepted = (value: string) => Boolean(mask & (1 << (value.length - 1)));
        const parser = new TexPrefixParser((value) => (accepted(value) ? value : null));

        for (let length = chunk; length <= source.length; length += chunk) {
          const candidate = source.slice(0, length);
          let expected = length;

          while (expected > 0 && !accepted(candidate.slice(0, expected))) {
            expected -= 1;
          }

          expect(parser.parse(candidate).tex.length).toBe(expected);
        }
      }
    }
  });
});

describe('unfinished control words', () => {
  test.each([
    [String.raw`x+\sin`, 2],
    [String.raw`x+\sinh`, 2],
    [String.raw`x+\sinh `, 8],
    [String.raw`x+\sin(x)`, 9],
    ['x+\\', 2],
    [String.raw`x+\\`, 4],
    [String.raw`x+\\alpha`, 9],
    [String.raw`\%`, 2],
    ['ordinary', 8],
  ])('holds only unfinished control tokens in %s', (source, end) => {
    expect(getTexStreamEnd(source)).toBe(end);
  });
});
