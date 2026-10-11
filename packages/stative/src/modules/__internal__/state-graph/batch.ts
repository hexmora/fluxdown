import type { StateNode } from './node';

// oxlint-disable-next-line typescript/no-extraneous-class
export class StateBatch {
  private static readonly pending = /*#__PURE__*/ new Set<StateNode>();

  private static depth = 0;

  private static flushing = false;

  static get canSettle() {
    return this.flushing && this.depth === 0;
  }

  private static flush() {
    if (this.depth > 0 || this.flushing) {
      return;
    }

    const errors: unknown[] = [];

    this.flushing = true;

    try {
      while (this.pending.size > 0) {
        try {
          for (const node of this.pending) {
            node.settle();

            this.pending.delete(node);
          }
        } catch (error) {
          errors.push(error);
        }
      }
    } finally {
      this.flushing = false;
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  static enqueue(node: StateNode) {
    this.pending.add(node);

    this.flush();
  }

  static dequeue(node: StateNode) {
    this.pending.delete(node);
  }

  static run<T>(runner: () => T): T {
    this.depth += 1;

    try {
      return runner();
    } finally {
      this.depth -= 1;

      this.flush();
    }
  }
}
