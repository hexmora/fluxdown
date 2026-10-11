import type { StateNode } from './node';

type StateContextOptions = { ordering?: boolean };

// oxlint-disable-next-line typescript/no-extraneous-class
export class StateContext {
  private static node: StateNode | null = null;

  private static currentOptions: StateContextOptions | undefined;

  static get current() {
    return this.node;
  }

  static get options() {
    return this.currentOptions;
  }

  static run<T>(node: StateNode | null, runner: () => T, options?: StateContextOptions): T {
    const previous = this.node;

    const previousOptions = this.currentOptions;

    this.node = node;

    this.currentOptions = options;

    try {
      return runner();
    } finally {
      this.node = previous;

      this.currentOptions = previousOptions;
    }
  }
}
