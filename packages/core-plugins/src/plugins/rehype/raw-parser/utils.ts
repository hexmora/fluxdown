import type { Nodes, Root, Text } from 'hast';

export const REPAIR_TEXT_TYPE = 'repaired_text';

interface RepairText {
  type: typeof REPAIR_TEXT_TYPE;
  original: Text;
}

const mapTree = <T extends Nodes>(node: T, transform: (node: Nodes) => Nodes): T => {
  const mapped = transform(node);

  if (!('children' in mapped)) {
    return mapped as T;
  }

  const children = mapped.children.map((child) => mapTree(child, transform));

  return children.every((child, index) => child === mapped.children[index])
    ? (mapped as T)
    : ({ ...mapped, children } as T);
};

/** Raw HTML parsing recreates ordinary text nodes and discards their plugin metadata. */
export const wrapRepairText = (tree: Root): Root =>
  mapTree(tree, (node) => {
    if (node.type !== 'text' || node.data?.repairEnding !== true) {
      return node;
    }

    // A pass-through leaf must not expose children: rehype-raw reparses those recursively.
    const wrapper: RepairText = { type: REPAIR_TEXT_TYPE, original: node };

    return wrapper as unknown as Nodes;
  });

export const unwrapRepairText = (tree: Root): Root =>
  mapTree(tree, (node) => {
    const candidate = node as Nodes | RepairText;

    return candidate.type === REPAIR_TEXT_TYPE ? candidate.original : node;
  });
