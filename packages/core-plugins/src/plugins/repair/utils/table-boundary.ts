import type { Parent, RootContent } from 'mdast';

import { isRepairSourceTail, isRepairTreeTail } from '../../../utils';

export const OPEN_REPAIR_TABLE_CELL = Symbol('open-repair-table-cell');

interface OpenTableBoundary {
  [OPEN_REPAIR_TABLE_CELL]?: () => boolean;
}

export type OpenRepairTableCellNode = (Parent | RootContent) & OpenTableBoundary;

const isStructuralTableTail = (node: Parent | RootContent, parents: Parent[]): boolean => {
  const row = parents[0];

  const header = parents[1]?.children[0];

  if (
    node.type !== 'tableCell' ||
    row?.type !== 'tableRow' ||
    header?.type !== 'tableRow' ||
    row.children.indexOf(node as RootContent) < 0 ||
    row.children.indexOf(node as RootContent) >= header.children.length
  ) {
    return false;
  }

  return isRepairTreeTail(node, parents);
};

/**
 * Validate the original physical boundary without consulting temporary pass metadata.
 */
export const hasOpenRepairTableCellSource = (
  node: Parent | RootContent,
  parents: Parent[],
): boolean => {
  if (!isStructuralTableTail(node, parents) || !isRepairSourceTail(node, parents)) {
    return false;
  }

  const source = node.data?.source ?? '';

  const closingPipe = /\|[ \t]*$/.exec(source);

  if (!closingPipe) {
    return true;
  }

  let escapes = 0;

  for (let offset = closingPipe.index - 1; source[offset] === '\\'; offset -= 1) {
    escapes += 1;
  }

  return escapes % 2 === 1;
};

export const isOpenRepairTableCell = (node: Parent | RootContent, parents: Parent[]): boolean => {
  const boundary = (node as OpenRepairTableCellNode)[OPEN_REPAIR_TABLE_CELL];

  return (
    (boundary?.() === true && isStructuralTableTail(node, parents)) ||
    hasOpenRepairTableCellSource(node, parents)
  );
};
