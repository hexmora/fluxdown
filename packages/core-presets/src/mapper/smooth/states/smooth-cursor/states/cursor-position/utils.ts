import type { BlockRevision } from '../block-revisions';

export const getPreservedIndex = (
  revisions: BlockRevision[],
  previous: BlockRevision[],
  index: number,
) => {
  let prefix = 0;

  for (const [blockIndex, revision] of revisions.entries()) {
    if (revision !== previous[blockIndex]) {
      index = Math.min(index, prefix + revision.prefixLength);
    }

    prefix += revision.length;
  }

  return index;
};
