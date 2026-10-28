import { splitInlineText } from '../utils';

describe('native inline text', () => {
  test('keeps English words and trailing spaces together without collapsing them', () => {
    expect(splitInlineText('one  two three')).toEqual(['one\u00a0\u00a0', 'two\u00a0', 'three']);
  });

  test('keeps Unicode graphemes and CJK punctuation intact', () => {
    const text = '你好，world 👨‍👩‍👧‍👦！';

    const words = splitInlineText(text);

    expect(words.join('').replace(/\u00a0/g, ' ')).toBe(text);

    expect(words.some((word) => word.includes('👨‍👩‍👧‍👦'))).toBe(true);

    expect(words).not.toContain('，');
  });

  test('treats Markdown soft line breaks as inline whitespace', () => {
    expect(splitInlineText('one\ntwo').join('')).toBe('one\u00a0two');
  });
});
