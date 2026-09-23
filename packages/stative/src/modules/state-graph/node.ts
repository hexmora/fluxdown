import { noop } from 'lodash-es';

import { dequeue, enqueue } from './batch';
import { withStateContext } from './context';

type StateUpdate = () => void;

type DependencyFrame = {
  node: StateNode;
  dependencies: MapIterator<StateNode>;
};

const nodes = /*#__PURE__*/ new WeakMap<object, StateNode>();

/** Dependencies describe notification order; dirty nodes are pulled before publication. */
export class StateNode {
  private readonly dependencies = new Map<StateNode, number>();

  private readonly dependents = new Set<StateNode>();

  private dirty = false;

  private settling = false;

  private disposed = false;

  private update: StateUpdate | null = null;

  dependOn(source: StateNode): () => void {
    if (source === this || source.disposed || this.disposed) {
      return noop;
    }

    this.dependencies.set(source, (this.dependencies.get(source) ?? 0) + 1);

    source.dependents.add(this);

    if (source.dirty) {
      this.invalidate();
    }

    let connected = true;

    return () => {
      if (!connected) {
        return;
      }

      connected = false;

      const count = this.dependencies.get(source) ?? 0;

      if (count > 1) {
        this.dependencies.set(source, count - 1);

        return;
      }

      this.dependencies.delete(source);

      source.dependents.delete(this);
    };
  }

  private invalidate() {
    const pending: StateNode[] = [this];

    for (let index = 0; index < pending.length; index++) {
      const node = pending[index];

      if (node.dirty || node.disposed) {
        continue;
      }

      node.dirty = true;

      for (const dependent of node.dependents) {
        pending.push(dependent);
      }
    }
  }

  schedule(update: StateUpdate) {
    if (this.disposed) {
      return;
    }

    this.update = update;

    this.invalidate();

    enqueue(this);
  }

  private needsSettle() {
    return this.dirty && !this.settling && !this.disposed;
  }

  private enter(): DependencyFrame {
    this.settling = true;

    return { node: this, dependencies: this.dependencies.keys() };
  }

  private hasDirtyDependency() {
    for (const source of this.dependencies.keys()) {
      if (source.needsSettle()) {
        return true;
      }
    }

    return false;
  }

  private publish() {
    const update = this.update;

    this.update = null;

    this.dirty = false;

    dequeue(this);

    if (update) {
      withStateContext(this, update);
    }
  }

  settle() {
    if (!this.needsSettle()) {
      if (!this.settling) {
        dequeue(this);
      }

      return;
    }

    const stack = [this.enter()];

    try {
      while (stack.length > 0) {
        const frame = stack[stack.length - 1];

        const source = frame.dependencies.next();

        if (!source.done) {
          if (source.value.needsSettle()) {
            stack.push(source.value.enter());
          }

          continue;
        }

        const node = frame.node;

        // An upstream callback may have written a dependency already visited by this frame.
        if (node.hasDirtyDependency()) {
          frame.dependencies = node.dependencies.keys();

          continue;
        }

        node.publish();

        if (node.dirty) {
          frame.dependencies = node.dependencies.keys();

          continue;
        }

        node.settling = false;

        stack.pop();
      }
    } finally {
      for (const frame of stack) {
        frame.node.settling = false;
      }
    }
  }

  destroy() {
    this.disposed = true;

    this.update = null;

    this.dirty = false;

    dequeue(this);

    for (const source of this.dependencies.keys()) {
      source.dependents.delete(this);
    }

    for (const target of this.dependents) {
      target.dependencies.delete(this);
    }

    this.dependencies.clear();

    this.dependents.clear();
  }
}

export const getStateNode = (state: object): StateNode => {
  let node = nodes.get(state);

  if (!node) {
    node = new StateNode();

    nodes.set(state, node);
  }

  return node;
};
