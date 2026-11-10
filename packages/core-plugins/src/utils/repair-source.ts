import type { ProcessMdastRunnerParams } from '@fluxdown/mdast';
import type { Parent, RootContent } from 'mdast';

import { isArray } from 'lodash-es';

import { hasRepairTextSource } from './repair-node';

interface RepairNodeSnapshot {
  node: Parent | RootContent;
  source: string | undefined;
  fields: (readonly [string, unknown])[];
}

const snapshotRepairNode = (node: Parent | RootContent): RepairNodeSnapshot => ({
  node,
  source: node.data?.source,
  fields: Object.entries(node)
    .filter(([key]) => key !== 'position' && key !== 'data')
    .map(([key, value]) => [key, isArray(value) ? [...value] : value] as const),
});

const isRepairNodeChanged = ({ node, source, fields }: RepairNodeSnapshot): boolean => {
  const values = node as unknown as Record<string, unknown>;

  const keys = Object.keys(node).filter((key) => key !== 'position' && key !== 'data');

  return (
    source !== node.data?.source ||
    keys.length !== fields.length ||
    fields.some(([key, previous]) => {
      const current = values[key];

      return isArray(previous)
        ? !isArray(current) ||
            previous.length !== current.length ||
            previous.some((item, index) => item !== current[index])
        : previous !== current;
    })
  );
};

const getRepairAncestors = (
  root: Parent | RootContent,
  target: Parent,
): (Parent | RootContent)[] => {
  const pending = [{ node: root, parents: [] as (Parent | RootContent)[] }];

  while (pending.length > 0) {
    const entry = pending.pop();

    if (!entry) {
      break;
    }

    if (entry.node === target) {
      return entry.parents;
    }

    if ('children' in entry.node) {
      pending.push(
        ...entry.node.children.map((child) => ({
          node: child,
          parents: [...entry.parents, entry.node],
        })),
      );
    }
  }

  return [];
};

/** Track the local mutation boundary and discard provenance that no longer describes it. */
export class RepairSourceTracker<T extends Parent | RootContent> {
  private params: ProcessMdastRunnerParams<T>;

  private children: RootContent[];

  private parentChildren: RootContent[] | undefined;

  private parentLength: number | undefined;

  private nodes: (Parent | RootContent)[];

  private snapshots: RepairNodeSnapshot[];

  private recursiveChanges: (Parent | RootContent)[] = [];

  private insertions: RootContent[] = [];

  constructor(params: ProcessMdastRunnerParams<T>) {
    this.params = params;

    const { node, parent, index } = params;

    this.children = 'children' in node ? [...node.children] : [];

    this.parentChildren = parent?.children;

    this.parentLength = this.parentChildren?.length;

    const siblings =
      index === undefined
        ? []
        : [this.parentChildren?.[index - 1], this.parentChildren?.[index + 1]];

    this.nodes = [node, ...this.children, ...siblings.filter((sibling) => sibling !== undefined)];

    this.snapshots = this.nodes.map(snapshotRepairNode);
  }

  recordInsertions(content: RootContent[]): void {
    this.insertions.push(...content.filter((item) => !this.nodes.includes(item)));
  }

  runRecursive(node: Parent, run: () => void): void {
    const source = node.data?.source;

    const ancestors = getRepairAncestors(this.params.node, node);

    try {
      run();
    } finally {
      if (source !== node.data?.source) {
        this.recursiveChanges.push(...ancestors);
      }
    }
  }

  invalidate(): void {
    const { node, parent, parents, index } = this.params;

    const changed = this.snapshots.filter(isRepairNodeChanged).map((snapshot) => snapshot.node);

    const parentChanged =
      parent &&
      (parent.children !== this.parentChildren ||
        parent.children.length !== this.parentLength ||
        (index !== undefined && parent.children[index] !== node));

    if (changed.length === 0 && !parentChanged && this.recursiveChanges.length === 0) {
      return;
    }

    const invalid = [
      ...changed,
      ...parents,
      ...this.recursiveChanges,
      ...this.insertions.filter((item) => !hasRepairTextSource(item)),
    ];

    if (parentChanged && index !== undefined) {
      const replacement = parent.children[index];

      if (replacement && !this.nodes.includes(replacement) && !hasRepairTextSource(replacement)) {
        invalid.push(replacement);
      }
    }

    if (changed.some((changedNode) => this.children.includes(changedNode as RootContent))) {
      invalid.push(node);
    }

    if ('children' in node) {
      invalid.push(
        ...node.children.filter(
          (child) => !this.children.includes(child) && !hasRepairTextSource(child),
        ),
      );
    }

    for (const changedNode of invalid) {
      if (changedNode.data?.source === undefined) {
        continue;
      }

      delete changedNode.data.source;

      if (Object.keys(changedNode.data).length === 0) {
        delete changedNode.data;
      }
    }
  }
}
