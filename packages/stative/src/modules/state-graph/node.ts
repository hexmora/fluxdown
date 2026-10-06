import { noop } from 'lodash-es';

import { dequeue, enqueue } from './batch';
import { withStateContext } from './context';
import { StateLinks } from './links';

type StateUpdate = () => void;

type DependencyFrame = {
  node: StateNode;
  dependencies: MapIterator<StateLinks<StateNode>>;
};

const nodes = /*#__PURE__*/ new WeakMap<object, StateNode>();

/** Dependencies describe notification order; dirty nodes are pulled before publication. */
export class StateNode {
  private readonly links: StateLinks<StateNode> = new StateLinks(this);

  private dirty = false;

  private settling = false;

  private disposed = false;

  private update: StateUpdate | null = null;

  dependOn(source: StateNode, { ordering = false }: { ordering?: boolean } = {}): () => void {
    if (source === this || source.disposed || this.disposed) {
      return noop;
    }

    this.links.connect(source.links, ordering);

    if (!ordering && source.dirty) {
      this.invalidate();
    }

    let connected = true;

    return () => {
      if (!connected) {
        return;
      }

      connected = false;

      this.links.disconnect(source.links, ordering);
    };
  }

  private invalidate() {
    if (this.dirty || this.disposed) {
      return;
    }

    this.dirty = true;

    const pending: StateNode[] = [this];

    for (let index = 0; index < pending.length; index++) {
      for (const [links, dependency] of pending[index].links.targets) {
        const { node } = links;

        if (dependency.normal === 0 || node.dirty || node.disposed) {
          continue;
        }

        node.dirty = true;

        pending.push(node);
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
    if (this.settling || this.disposed) {
      return false;
    }

    if (this.dirty) {
      return true;
    }

    if (this.links.barriers) {
      for (const { node } of this.links.barriers) {
        if (node.dirty && !node.settling && !node.disposed) {
          return true;
        }
      }
    }

    return false;
  }

  private enter(): DependencyFrame {
    this.settling = true;

    return { node: this, dependencies: this.links.sources.keys() };
  }

  private hasDirtyDependency() {
    for (const source of this.links.sources.keys()) {
      if (source.node.needsSettle()) {
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
      return;
    }

    const stack = [this.enter()];

    try {
      while (stack.length > 0) {
        const frame = stack[stack.length - 1];

        const source = frame.dependencies.next();

        if (!source.done) {
          if (source.value.node.needsSettle()) {
            stack.push(source.value.node.enter());
          }

          continue;
        }

        const node = frame.node;

        // An upstream callback may have written a dependency already visited by this frame.
        if (node.hasDirtyDependency()) {
          frame.dependencies = node.links.sources.keys();

          continue;
        }

        node.publish();

        if (node.dirty) {
          frame.dependencies = node.links.sources.keys();

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

    this.links.destroy();
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
