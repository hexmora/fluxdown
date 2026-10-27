import type { Element, ElementContent, Root as HastRoot, RootContent, Text } from 'hast';

import { getTextUnits, isHiddenTagName } from '@fluxdown/hast';

import type { ChunkCharacter, ChunkRootConfig } from './type';

import { CHUNK_DATA_ATTR, CHUNK_TAG_NAME, FORBIDDEN_TAG_NAMES } from './consts';

export * from './consts';
export * from './type';

const isForbidden = (node: Element) =>
  isHiddenTagName(node.tagName) ||
  FORBIDDEN_TAG_NAMES.includes(node.tagName.toLowerCase()) ||
  node.properties.dataType === 'inline-math' ||
  node.properties.dataType === 'block-math' ||
  node.properties.dataParserPatch === '1';

const toChunkCharacters = (
  root: HastRoot,
  previous: ChunkCharacter[],
  { initial, start, duration }: ChunkRootConfig,
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

  return units.map((text, index): ChunkCharacter => {
    const existing =
      index < prefix ? previous[index] : previous[previous.length - units.length + index];

    if (existing && (index < prefix || index >= units.length - suffix)) {
      // Completed content stays settled even if the configured duration later increases.
      return existing.start >= 0 && existing.start + existing.duration <= start
        ? { text: existing.text, start: -1, duration: existing.duration }
        : existing;
    }

    return { text, start: initial ? -1 : start, duration };
  });
};

const createChunkText = (
  node: Text,
  characters: ChunkCharacter[],
  now: number,
): ElementContent[] => {
  // Preserve structural whitespace without creating an animated text box around it.
  if (
    !node.value.trim() ||
    characters.every(({ start, duration }) => start < 0 || start + duration <= now)
  ) {
    return [node];
  }

  const children: ElementContent[] = [];

  for (const { text, start, duration } of characters) {
    const previous = children[children.length - 1];

    if (start < 0 || start + duration <= now) {
      if (previous?.type === 'text') {
        previous.value += text;
      } else {
        children.push({ ...node, value: text });
      }

      continue;
    }

    if (
      previous?.type === 'element' &&
      previous.properties.dataChunkStart === start &&
      previous.properties.dataChunkDuration === duration
    ) {
      (previous.children[0] as Text).value += text;

      continue;
    }

    children.push({
      type: 'element',
      tagName: CHUNK_TAG_NAME,
      properties: {
        [CHUNK_DATA_ATTR]: '1',
        dataChunkStart: start,
        dataChunkDuration: duration,
      },
      children: [{ ...node, value: text }],
    });
  }

  return children;
};

/** Keeps batch entrance times across appends and Markdown reparsing. */
export const createChunkRoot = (
  root: HastRoot,
  previous: ChunkCharacter[],
  options: ChunkRootConfig,
) => {
  const config = {
    ...options,
    duration: Number.isFinite(options.duration) ? Math.max(0, options.duration) : 400,
  };

  const characters = toChunkCharacters(root, previous, config);

  let offset = 0;

  const visit = (node: RootContent): RootContent[] => {
    if (node.type === 'text') {
      const length = Array.from(getTextUnits(node.value)).length;

      const selected = characters.slice(offset, offset + length);

      offset += length;

      return createChunkText(node, selected, config.start);
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
