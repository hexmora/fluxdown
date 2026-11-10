import type { Parent, RootContent } from 'mdast';

import { isRepairSourceTail } from '../../../utils';

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

  let branch = node;

  for (const parent of parents) {
    if (parent.children.at(-1) !== branch) {
      return false;
    }

    branch = parent;
  }

  return true;
};

/** Validate the original physical boundary without consulting temporary pass metadata. */
const hasOpenRepairTableCellSource = (node: Parent | RootContent, parents: Parent[]): boolean => {
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

/** Retain a validated physical boundary while individual repairs consume its source. */
export const retainOpenTableCellBoundary = (root: Parent | RootContent) => {
  let current = root;

  const parents: Parent[] = [];

  while ('children' in current) {
    const child: RootContent | undefined = current.children.at(-1);

    if (!child) {
      break;
    }

    parents.unshift(current);

    current = child;

    if (current.type === 'tableCell') {
      if (!hasOpenRepairTableCellSource(current, parents)) {
        return;
      }

      const cell = current as OpenRepairTableCellNode;

      let active = true;

      // Deep clones retain the function identity and therefore the same pass lifetime.
      const boundary = () => active;

      cell[OPEN_REPAIR_TABLE_CELL] = boundary;

      return () => {
        active = false;

        // Replacements can clone the cell, so clear both detached and surviving nodes.
        const pending: OpenRepairTableCellNode[] = [root, cell];

        while (pending.length > 0) {
          const node = pending.pop();

          if (!node) {
            continue;
          }

          if (node[OPEN_REPAIR_TABLE_CELL] === boundary) {
            delete node[OPEN_REPAIR_TABLE_CELL];
          }

          if ('children' in node) {
            pending.push(...node.children);
          }
        }
      };
    }
  }
};
