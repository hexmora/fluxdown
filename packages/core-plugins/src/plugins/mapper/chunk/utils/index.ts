import type { Root as HastRoot } from 'hast';

import type { ChunkCharacter, ChunkRootConfig } from './type';

import { createEntranceRoot } from '../../../../utils';
import { CHUNK_DATA_ATTR, CHUNK_TAG_NAME } from './consts';

export * from './consts';
export * from './type';

/** Keeps batch entrance times across appends and Markdown reparsing. */
export const createChunkRoot = (
  root: HastRoot,
  previous: ChunkCharacter[],
  { initial, start, duration }: ChunkRootConfig,
) =>
  createEntranceRoot(root, previous, {
    initial,
    start,
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 400,
    wrap: (text, entrance, length, index) => ({
      type: 'element',
      tagName: CHUNK_TAG_NAME,
      properties: {
        [CHUNK_DATA_ATTR]: '1',
        dataChunkStart: entrance,
        dataChunkDuration: length,
      },
      data: { renderKey: `chunk:${index}:${entrance}` },
      children: [text],
    }),
    isWrapper: (element, entrance, length) =>
      element.properties.dataChunkStart === entrance &&
      element.properties.dataChunkDuration === length,
  });
