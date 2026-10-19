import type { Element, ElementContent, Root as HastRoot, RootContent, Text } from 'hast';

import { getTextUnits, isHiddenTagName } from '@fluxdown/hast';

import type { ScaleCharacter, ScaleRootConfig } from './type';

import {
  FORBIDDEN_TAG_NAMES,
  SCALE_CHAR_VALUE,
  SCALE_DATA_ATTR,
  SCALE_TAG_NAME,
  SCALE_WORD_VALUE,
} from './consts';

export * from './consts';
export * from './type';

const isForbidden = (node: Element) => {
  return (
    isHiddenTagName(node.tagName) ||
    FORBIDDEN_TAG_NAMES.includes(node.tagName.toLowerCase()) ||
    node.properties.dataType === 'inline-math' ||
    node.properties.dataType === 'block-math' ||
    node.properties.dataParserPatch === '1'
  );
};

const getWords = (text: string) => {
  const segmenter =
    typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function'
      ? null
      : new Intl.Segmenter(undefined, { granularity: 'word' });

  const segments = segmenter
    ? Array.from(segmenter.segment(text), ({ segment }) => segment)
    : (text.match(/\s+|[\p{Script=Latin}\p{N}]+|[^\s]/gu) ?? []);

  const words: string[] = [];

  for (const segment of segments) {
    const previous = words[words.length - 1];

    const boundary = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

    if (
      previous &&
      !/\s/.test(previous + segment) &&
      (!boundary.test(previous + segment) ||
        /^[\p{Pe}\p{Pf},.!?:;。、，．！？：；]/u.test(segment) ||
        /[\p{Ps}\p{Pi}]$/u.test(previous))
    ) {
      words[words.length - 1] = previous + segment;

      continue;
    }

    words.push(segment);
  }

  return words;
};

const toScaleCharacters = (
  root: HastRoot,
  previous: ScaleCharacter[],
  { initial, start }: ScaleRootConfig,
) => {
  const units: string[] = [];

  const visit = (node: HastRoot | RootContent) => {
    if (node.type === 'text') {
      for (const unit of getTextUnits(node.value)) {
        units.push(unit);
      }
    } else if (node.type === 'root' || (node.type === 'element' && !isForbidden(node))) {
      node.children.forEach(visit);
    }
  };

  visit(root);

  let prefix = 0;

  while (prefix < units.length && units[prefix] === previous[prefix]?.text) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    suffix < units.length - prefix &&
    suffix < previous.length - prefix &&
    units[units.length - suffix - 1] === previous[previous.length - suffix - 1]?.text
  ) {
    suffix += 1;
  }

  return units.map((text, index): ScaleCharacter => {
    const existing =
      index < prefix ? previous[index] : previous[previous.length - units.length + index];

    if (existing && (index < prefix || index >= units.length - suffix)) {
      return existing;
    }

    return { text, start: initial ? 0 : start };
  });
};

const createScaleText = (
  node: Text,
  characters: ScaleCharacter[],
  config: ScaleRootConfig,
): ElementContent[] => {
  const isSettled = ({ start }: ScaleCharacter) =>
    start === 0 || start + config.duration <= config.start;

  if (characters.every(isSettled)) {
    return [node];
  }

  const children: ElementContent[] = [];

  let offset = 0;

  let settled = '';

  for (const word of getWords(node.value)) {
    const length = Array.from(getTextUnits(word)).length;

    const selected = characters.slice(offset, offset + length);

    offset += length;

    if (/^\s+$/.test(word) || selected.every(isSettled)) {
      settled += word;

      continue;
    }

    if (settled) {
      children.push({ ...node, value: settled });

      settled = '';
    }

    children.push({
      type: 'element',
      tagName: SCALE_TAG_NAME,
      properties: { [SCALE_DATA_ATTR]: SCALE_WORD_VALUE },
      children: selected.map(({ text, start }) => ({
        type: 'element',
        tagName: SCALE_TAG_NAME,
        properties: {
          [SCALE_DATA_ATTR]: SCALE_CHAR_VALUE,
          dataScaleStart: start,
          dataScaleDuration: config.duration,
          dataScaleFrom: config.from,
          dataScaleBlur: config.blur,
        },
        children: [{ ...node, value: text }],
      })),
    });
  }

  if (settled) {
    children.push({ ...node, value: settled });
  }

  return children;
};

/** Keeps character entrance times across appends and Markdown reparsing. */
export const createScaleRoot = (
  root: HastRoot,
  previous: ScaleCharacter[],
  options: ScaleRootConfig,
) => {
  const characters = toScaleCharacters(root, previous, options);

  const config = {
    ...options,
    duration: Number.isFinite(options.duration) ? Math.max(0, options.duration) : 200,
    from: Number.isFinite(options.from) ? Math.min(1, Math.max(0, options.from)) : 0,
    blur: Number.isFinite(options.blur) ? Math.max(0, options.blur) : 0.08,
  };

  let offset = 0;

  const visit = (node: RootContent): RootContent[] => {
    if (node.type === 'text') {
      const length = Array.from(getTextUnits(node.value)).length;

      const selected = characters.slice(offset, offset + length);

      offset += length;

      return createScaleText(node, selected, config);
    }

    if (node.type !== 'element' || isForbidden(node)) {
      return [node];
    }

    const children = node.children.flatMap(visit) as ElementContent[];

    return [
      children.length === node.children.length &&
      children.every((child, index) => child === node.children[index])
        ? node
        : { ...node, children },
    ];
  };

  const children = root.children.flatMap(visit);

  return {
    root:
      children.length === root.children.length &&
      children.every((child, index) => child === root.children[index])
        ? root
        : { ...root, children },
    characters,
  };
};
