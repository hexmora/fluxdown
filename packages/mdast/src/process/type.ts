import type { Parent, RootContent } from 'mdast';

export interface ProcessMdastParams<T extends RootContent | Parent = Parent> {
  /**
   * Root node where the traversal starts.
   */
  node: RootContent | T;

  /**
   * Callback invoked when a node is visited.
   */
  runner: ProcessMdastRunner<T>;

  /**
   * Invoke the runner only for these node types. Other nodes still have their
   * children traversed. Omit to visit every node.
   */
  allows?: string | string[];

  /**
   * Traversal order:
   * - pre: pre-order traversal
   * - post: post-order traversal
   * - in: in-order traversal, extended from binary trees; in an n-ary tree,
   *   a non-leaf node is visited the second time it is encountered.
   * @default 'pre'
   */
  order?: 'pre' | 'post' | 'in';

  /**
   * Whether to reverse left and right order. When true, right nodes are visited
   * before left nodes, while the parent-child visit order remains unchanged.
   * @default false
   */
  rightFirst?: boolean;

  /**
   * Visit the whole tree, or follow only the last child of each parent.
   * Children are still captured before the runner mutates the current node.
   * @default 'tree'
   */
  scope?: 'tree' | 'tail';
}

export type ProcessMdastRunnerParams<T extends RootContent | Parent = Parent> = {
  /**
   * Node currently being visited.
   */
  node: RootContent | T;

  /**
   * Direct parent of the current node.
   */
  parent: Parent | undefined;

  /**
   * Parent node list, ordered from nearest to farthest.
   */
  parents: Parent[];

  /**
   * Index of the current node within its parent.
   */
  index: number | undefined;

  /**
   * Stops the traversal after the current visit.
   */
  break: () => void;

  /**
   * Skips the current node's child tree when traversal order allows it.
   */
  skipTree: () => void;

  /**
   * Inserts nodes immediately after the current node, or replaces it when requested.
   */
  insertNext: (content: RootContent[], replaceCurrent?: boolean) => void;
};

type ProcessMdastRunner<T extends RootContent | Parent = Parent> = (
  /**
   * Visit payload containing the current node, traversal context, and actions.
   */
  params: ProcessMdastRunnerParams<T>,
) => void;
