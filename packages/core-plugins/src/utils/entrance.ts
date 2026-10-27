import type { Element, ElementContent, Root as HastRoot, RootContent, Text } from 'hast';

import { getTextUnits, isHiddenTagName } from '@fluxdown/hast';

/**
 * One visible text unit and the entrance it plays.
 */
export interface EntranceCharacter {
  text: string;

  /**
   * Entrance start in `performance.now()` milliseconds, or -1 once settled.
   */
  start: number;

  /**
   * Duration captured when the character first became visible.
   */
  duration: number;
}

export interface EntranceOptions {
  /**
   * Treat every character as already settled, for content present before the effect mounted.
   */
  initial: boolean;

  start: number;

  /**
   * Duration for characters that become visible in this update. A function receives how many
   * arrived, so the duration can adapt to the size of the batch.
   */
  duration: number | ((added: number) => number);

  /**
   * Wrap a run of characters that share one entrance.
   */
  wrap: (text: Text, start: number, duration: number) => Element;

  /**
   * Whether `element` is a wrapper created by `wrap` for this exact entrance.
   */
  isWrapper: (element: Element, start: number, duration: number) => boolean;
}

// oxlint-disable-next-line unicorn/prefer-set-has -- Fixed lookup tables use arrays by convention.
const FORBIDDEN_TAG_NAMES = ['annotation', 'code', 'math', 'pre', 'svg'];

/**
 * Content whose text must not be split: code, formulas, hidden nodes, and parser patches.
 */
export const isEntranceForbidden = (node: Element) =>
  isHiddenTagName(node.tagName) ||
  FORBIDDEN_TAG_NAMES.includes(node.tagName.toLowerCase()) ||
  node.properties.dataType === 'inline-math' ||
  node.properties.dataType === 'block-math' ||
  node.properties.dataParserPatch === '1';

const isSettled = ({ start, duration }: EntranceCharacter, now: number) =>
  start < 0 || start + duration <= now;

const toCharacters = (
  root: HastRoot,
  previous: EntranceCharacter[],
  { initial, start, duration }: EntranceOptions,
) => {
  const units: string[] = [];

  const visit = (node: HastRoot | RootContent) => {
    if (node.type === 'text') {
      for (const unit of getTextUnits(node.value)) {
        units.push(unit);
      }
    } else if (node.type === 'root' || (node.type === 'element' && !isEntranceForbidden(node))) {
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

  const added = units.length - prefix - suffix;

  const resolved = typeof duration === 'function' ? duration(initial ? 0 : added) : duration;

  const incoming = Number.isFinite(resolved) ? Math.max(0, resolved) : 0;

  return units.map((text, index): EntranceCharacter => {
    const existing =
      index < prefix ? previous[index] : previous[previous.length - units.length + index];

    if (existing && (index < prefix || index >= units.length - suffix)) {
      // Completed content stays settled even if the configured duration later increases.
      return existing.start >= 0 && isSettled(existing, start)
        ? { text: existing.text, start: -1, duration: existing.duration }
        : existing;
    }

    return { text, start: initial ? -1 : start, duration: incoming };
  });
};

const createText = (
  node: Text,
  characters: EntranceCharacter[],
  { start: now, wrap, isWrapper }: EntranceOptions,
): ElementContent[] => {
  // Preserve structural whitespace without creating an animated text box around it.
  if (!node.value.trim() || characters.every((character) => isSettled(character, now))) {
    return [node];
  }

  const children: ElementContent[] = [];

  for (const character of characters) {
    const { text, start, duration } = character;

    const previous = children[children.length - 1];

    if (isSettled(character, now)) {
      if (previous?.type === 'text') {
        previous.value += text;
      } else {
        children.push({ ...node, value: text });
      }

      continue;
    }

    if (previous?.type === 'element' && isWrapper(previous, start, duration)) {
      (previous.children[0] as Text).value += text;

      continue;
    }

    children.push(wrap({ ...node, value: text }, start, duration));
  }

  return children;
};

/**
 * Keep per-character entrance times across appends and Markdown reparsing, and wrap the runs
 * that are still animating. Settled text is returned as plain text nodes.
 */
export const createEntranceRoot = (
  root: HastRoot,
  previous: EntranceCharacter[],
  options: EntranceOptions,
) => {
  const characters = toCharacters(root, previous, options);

  let offset = 0;

  const visit = (node: RootContent): RootContent[] => {
    if (node.type === 'text') {
      const length = Array.from(getTextUnits(node.value)).length;

      const selected = characters.slice(offset, offset + length);

      offset += length;

      return createText(node, selected, options);
    }

    if (node.type !== 'element' || isEntranceForbidden(node)) {
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
