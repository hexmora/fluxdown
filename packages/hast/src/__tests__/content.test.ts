import { getTextUnits, getTextWords, getTextWordStart } from '../content';

test.each([
  { text: 'same paragraph, while', index: 9, start: 5 },
  { text: '同一段。Streaming', index: 7, start: 4 },
  { text: '轻轻衔接。每个字', index: 4, start: 3 },
  { text: '（下一段）', index: 1, start: 0 },
  { text: 'hello world', index: 5, start: 5 },
  { text: '👩‍💻é 中文', index: 1, start: 0 },
])('finds the complete word containing unit $index in $text', ({ text, index, start }) => {
  expect(getTextWordStart([...getTextUnits(text)], index)).toBe(start);
});

test('preserves natural word boundaries and complete graphemes', () => {
  expect([...getTextWords('word 中，（下一段） 👩‍💻é')]).toEqual([
    'word',
    ' ',
    '中，',
    '（下',
    '一',
    '段）',
    ' ',
    '👩‍💻é',
  ]);
});

test.each([
  {
    text: 'word 中，（下一段） 👩‍💻é',
    words: ['word', ' ', '中，（下一段）', ' ', '👩‍💻é'],
  },
  {
    text: '中文（ABC）中文VeryLongEnglishWordWithoutWhitespace next',
    words: ['中文', '（ABC）', '中文', 'VeryLongEnglishWordWithoutWhitespace', ' ', 'next'],
  },
  {
    text: '日本かな한글 क्षि é 👩‍💻',
    words: ['日本かな한글', ' ', 'क्षि', ' ', 'é', ' ', '👩‍💻'],
  },
])('merges adjacent CJK words without changing other boundaries in $text', ({ text, words }) => {
  expect([...getTextWords(text, { mergeCjk: true })]).toEqual(words);

  expect(words.join('')).toBe(text);

  expect([...getTextWords(text, { mergeCjk: false })]).toEqual([...getTextWords(text)]);
});
