import { reverse } from 'lodash-es';
import { Subscription } from 'rxjs';

import type { IReadableClosure } from '../../../type';

export type DescriptorScope = {
  detached: boolean;
  destroyed: boolean;
  closures: Set<IReadableClosure<unknown>>;
  detachers: Array<() => void>;
  resources: Array<() => void>;
};

type ClosureContext = {
  scope: DescriptorScope | null;
  owners: Set<DescriptorScope>;
};

// oxlint-disable-next-line typescript/no-extraneous-class
export class DescriptorContext {
  private static readonly key = /*#__PURE__*/ Symbol('closureContext');

  private static constructionScope: DescriptorScope | null = null;

  static get(closure: IReadableClosure<unknown>): ClosureContext {
    const target = closure as IReadableClosure<unknown> & {
      [DescriptorContext.key]?: ClosureContext;
    };

    const existing = Object.hasOwn(target, this.key) ? target[this.key] : undefined;

    if (existing) {
      return existing;
    }

    const context: ClosureContext = { scope: null, owners: new Set() };

    Object.defineProperty(target, this.key, { value: context });

    return context;
  }

  static run<T>(scope: DescriptorScope, callback: () => T): T {
    const previous = this.constructionScope;

    this.constructionScope = scope;

    try {
      return callback();
    } finally {
      this.constructionScope = previous;
    }
  }

  static consume(): DescriptorScope | null {
    const scope = this.constructionScope;

    this.constructionScope = null;

    return scope;
  }
}

export const createDescriptorScope = (): DescriptorScope => ({
  detached: false,
  destroyed: false,
  closures: new Set(),
  detachers: [],
  resources: [],
});

export const assertDescriptorScope = (scope: DescriptorScope) => {
  if (scope.detached || scope.destroyed) {
    throw new TypeError('Cannot build from a destroyed descriptor graph.');
  }
};

export const clearWithDescriptorScope = (scope: DescriptorScope, cleanup: () => void) => {
  scope.resources.push(cleanup);
};

export const detachWithDescriptorScope = (scope: DescriptorScope, detach: () => void) => {
  scope.detachers.push(detach);
};

export const ownReadableClosure = <T extends IReadableClosure<unknown>>(
  scope: DescriptorScope,
  closure: T,
): T => {
  if (scope.closures.has(closure)) {
    return closure;
  }

  const { owners } = DescriptorContext.get(closure);

  owners.add(scope);

  scope.closures.add(closure);

  return closure;
};

export const releaseReadableClosure = (
  scope: DescriptorScope,
  closure: IReadableClosure<unknown>,
) => {
  if (!scope.closures.delete(closure)) {
    return;
  }

  const { owners } = DescriptorContext.get(closure);

  owners.delete(scope);

  if (owners.size === 0) {
    closure.destroy();
  }
};

const detachDescriptorScope = (scope: DescriptorScope) => {
  if (scope.detached) {
    return;
  }

  scope.detached = true;

  const teardown = new Subscription();

  for (const detach of reverse(scope.detachers.splice(0))) {
    teardown.add(detach);
  }

  for (const closure of scope.closures) {
    teardown.add(() => {
      const { scope: childScope, owners } = DescriptorContext.get(closure);

      if (childScope && [...owners].every((owner) => owner.detached)) {
        detachDescriptorScope(childScope);
      }
    });
  }

  teardown.unsubscribe();
};

export const destroyDescriptorScope = (scope: DescriptorScope, destroy?: () => void) => {
  if (scope.destroyed) {
    return;
  }

  scope.destroyed = true;

  const teardown = new Subscription(() => detachDescriptorScope(scope));

  for (const closure of reverse([...scope.closures])) {
    teardown.add(() => releaseReadableClosure(scope, closure));
  }

  teardown.add(destroy);

  for (const cleanup of scope.resources.splice(0)) {
    teardown.add(cleanup);
  }

  teardown.unsubscribe();
};

export const bindRootDescriptorScope = <T extends IReadableClosure<unknown>>(
  scope: DescriptorScope,
  closure: T,
): T => {
  const context = DescriptorContext.get(closure);

  const previous = context.scope;

  if (previous === scope) {
    return closure;
  }

  if (previous) {
    scope.resources.push(...previous.resources.splice(0));

    scope.detachers.push(...previous.detachers.splice(0));

    for (const child of previous.closures) {
      ownReadableClosure(scope, child);

      releaseReadableClosure(previous, child);
    }
  } else {
    const destroy = closure.destroy.bind(closure);

    closure.destroy = () => {
      destroyDescriptorScope(context.scope!, destroy);
    };
  }

  context.scope = scope;

  return closure;
};

export const getReadableClosureScope = (closure: IReadableClosure<unknown>): DescriptorScope => {
  const { scope: current } = DescriptorContext.get(closure);

  if (current) {
    return current;
  }

  const scope = createDescriptorScope();

  bindRootDescriptorScope(scope, closure);

  return scope;
};
