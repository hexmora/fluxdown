// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const HIDDEN_TAG_NAMES = ['script', 'style', 'template'];

const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

const SEGMENTER =
  typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function'
    ? null
    : new Intl.Segmenter(undefined, {
        granularity: 'grapheme',
      });

export const getTextUnits = function* (value: string): Generator<string> {
  if (!SEGMENTER) {
    yield* value;

    return;
  }

  for (const { segment } of SEGMENTER.segment(value)) {
    yield segment;
  }
};

const splitTextWords = function* (value: string): Generator<string> {
  let word = '';

  for (const unit of getTextUnits(value)) {
    if (
      word &&
      (/\s/.test(word + unit) ||
        (CJK.test(word + unit) &&
          !/^[\p{Pe}\p{Pf},.!?:;。、，．！？：；]/u.test(unit) &&
          !/[\p{Ps}\p{Pi}]$/u.test(word)))
    ) {
      yield word;

      word = unit;
    } else {
      word += unit;
    }
  }

  if (word) {
    yield word;
  }
};

export const getTextWords = function* (
  value: string,
  { mergeCjk = false }: { mergeCjk?: boolean } = {},
): Generator<string> {
  if (!mergeCjk) {
    yield* splitTextWords(value);

    return;
  }

  let previous = '';

  for (const word of splitTextWords(value)) {
    if (previous && CJK.test(previous) && CJK.test(word)) {
      previous += word;
    } else {
      if (previous) {
        yield previous;
      }

      previous = word;
    }
  }

  if (previous) {
    yield previous;
  }
};

export const getTextWordStart = (units: readonly string[], index: number) => {
  let start = index;

  while (start > 0 && !/\s/.test(units[start - 1]!)) {
    start -= 1;

    if (CJK.test(units[start]!)) {
      break;
    }
  }

  // Only inspect the current word and its nearest CJK or whitespace boundary.
  for (const word of getTextWords(units.slice(start, index + 1).join(''))) {
    const end = start + [...getTextUnits(word)].length;

    if (end > index) {
      return start;
    }

    start = end;
  }

  return index;
};

export const isHiddenTagName = (tagName: string) => {
  return HIDDEN_TAG_NAMES.includes(tagName.toLowerCase());
};
