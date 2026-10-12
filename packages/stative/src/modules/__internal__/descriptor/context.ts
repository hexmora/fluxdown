import { isFunction } from 'lodash-es';
import { UnsubscriptionError } from 'rxjs';

import type { DestroyableLike } from '../state';

type Cleanup = () => void;

type Cleanups = Cleanup | Cleanup[] | null;

export type DescriptorScope = {
  detached: boolean;
  destroyed: boolean;
  closures: Set<DestroyableLike> | null;
  detachers: Cleanups;
  resources: Cleanups;
};

type ClosureContext = {
  scope: DescriptorScope | null;
  owners: number;
  activeOwners: number;
  originalDestroy: (() => void) | null;
};

type DescriptorClosureLike = DestroyableLike & {
  readonly __closureContext?: ClosureContext;
};

// oxlint-disable-next-line typescript/no-extraneous-class
export class DescriptorContext {
  private static constructionScope: DescriptorScope | null = null;

  static get(closure: DescriptorClosureLike): ClosureContext {
    const existing = Object.hasOwn(closure, '__closureContext')
      ? closure.__closureContext
      : undefined;

    if (existing) {
      return existing;
    }

    const context: ClosureContext = {
      scope: null,
      owners: 0,
      activeOwners: 0,
      originalDestroy: null,
    };

    Object.defineProperty(closure, '__closureContext', { value: context });

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
  closures: null,
  detachers: null,
  resources: null,
});

export const assertDescriptorScope = (scope: DescriptorScope) => {
  if (scope.detached || scope.destroyed) {
    throw new TypeError('Cannot build from a destroyed descriptor graph.');
  }
};

export const clearWithDescriptorScope = (scope: DescriptorScope, cleanup: () => void) => {
  scope.resources = appendCleanup(scope.resources, cleanup);
};

export const detachWithDescriptorScope = (scope: DescriptorScope, detach: () => void) => {
  scope.detachers = appendCleanup(scope.detachers, detach);
};

const appendCleanup = (current: Cleanups, next: Cleanups): Cleanups => {
  if (!current || !next) {
    return current ?? next;
  }

  const result = isFunction(current) ? [current] : current;

  if (isFunction(next)) {
    result.push(next);
  } else {
    result.push(...next);
  }

  return result;
};

export const ownReadableClosure = <T extends DestroyableLike>(
  scope: DescriptorScope,
  closure: T,
): T => {
  if (scope.closures?.has(closure)) {
    return closure;
  }

  const context = DescriptorContext.get(closure);

  context.owners += 1;

  if (!scope.detached) {
    context.activeOwners += 1;
  }

  (scope.closures ??= new Set()).add(closure);

  return closure;
};

export const releaseReadableClosure = (scope: DescriptorScope, closure: DestroyableLike) => {
  if (!scope.closures?.delete(closure)) {
    return;
  }

  const context = DescriptorContext.get(closure);

  context.owners -= 1;

  if (!scope.detached) {
    context.activeOwners -= 1;
  }

  if (context.owners === 0) {
    closure.destroy();
  }
};

const appendCleanupError = (errors: unknown[] | undefined, error: unknown): unknown[] => {
  const result = errors ?? [];

  if (error instanceof UnsubscriptionError) {
    result.push(...error.errors);
  } else {
    result.push(error);
  }

  return result;
};

const runCleanups = (cleanups: Cleanups, reverse = false) => {
  if (!cleanups) {
    return;
  }

  if (isFunction(cleanups)) {
    cleanups();

    return;
  }

  let errors: unknown[] | undefined;

  for (
    let index = reverse ? cleanups.length - 1 : 0;
    reverse ? index >= 0 : index < cleanups.length;
    index += reverse ? -1 : 1
  ) {
    try {
      const cleanup = cleanups[index];

      cleanup();
    } catch (error) {
      errors = appendCleanupError(errors, error);
    }
  }

  if (errors) {
    throw new UnsubscriptionError(errors);
  }
};

const detachDescriptorScope = (scope: DescriptorScope) => {
  if (scope.detached) {
    return;
  }

  scope.detached = true;

  let errors: unknown[] | undefined;

  // Publish every released owner before cleanup can reenter another shared scope.
  if (scope.closures) {
    for (const closure of scope.closures) {
      try {
        DescriptorContext.get(closure).activeOwners -= 1;
      } catch (error) {
        errors = appendCleanupError(errors, error);
      }
    }
  }

  const detachers = scope.detachers;

  scope.detachers = null;

  try {
    runCleanups(detachers, true);
  } catch (error) {
    errors = appendCleanupError(errors, error);
  }

  if (scope.closures) {
    for (const closure of scope.closures) {
      try {
        const { scope: childScope, activeOwners } = DescriptorContext.get(closure);

        if (childScope && activeOwners === 0) {
          detachDescriptorScope(childScope);
        }
      } catch (error) {
        errors = appendCleanupError(errors, error);
      }
    }
  }

  if (errors) {
    throw new UnsubscriptionError(errors);
  }
};

export const destroyDescriptorScope = (
  scope: DescriptorScope,
  destroy?: () => void,
  receiver?: DestroyableLike,
) => {
  if (scope.destroyed) {
    return;
  }

  scope.destroyed = true;

  let errors: unknown[] | undefined;

  try {
    detachDescriptorScope(scope);
  } catch (error) {
    errors = appendCleanupError(errors, error);
  }

  if (scope.closures) {
    const closures = [...scope.closures];

    for (let index = closures.length - 1; index >= 0; index--) {
      try {
        releaseReadableClosure(scope, closures[index]);
      } catch (error) {
        errors = appendCleanupError(errors, error);
      }
    }

    scope.closures = null;
  }

  try {
    destroy?.call(receiver);
  } catch (error) {
    errors = appendCleanupError(errors, error);
  }

  const resources = scope.resources;

  scope.resources = null;

  try {
    runCleanups(resources);
  } catch (error) {
    errors = appendCleanupError(errors, error);
  }

  if (errors) {
    throw new UnsubscriptionError(errors);
  }
};

function destroyReadableClosure(this: DestroyableLike) {
  const context = DescriptorContext.get(this);

  destroyDescriptorScope(context.scope!, context.originalDestroy!, this);
}

export const bindRootDescriptorScope = <T extends DestroyableLike>(
  scope: DescriptorScope,
  closure: T,
): T => {
  const context = DescriptorContext.get(closure);

  const previous = context.scope;

  if (previous === scope) {
    return closure;
  }

  if (previous) {
    if (previous.resources) {
      scope.resources = appendCleanup(scope.resources, previous.resources);

      previous.resources = null;
    }

    if (previous.detachers) {
      scope.detachers = appendCleanup(scope.detachers, previous.detachers);

      previous.detachers = null;
    }

    if (previous.closures) {
      for (const child of previous.closures) {
        ownReadableClosure(scope, child);

        releaseReadableClosure(previous, child);
      }
    }
  } else {
    context.originalDestroy = closure.destroy;

    closure.destroy = destroyReadableClosure.bind(closure);
  }

  context.scope = scope;

  return closure;
};

export const getReadableClosureScope = (closure: DestroyableLike): DescriptorScope => {
  const { scope: current } = DescriptorContext.get(closure);

  if (current) {
    return current;
  }

  const scope = createDescriptorScope();

  bindRootDescriptorScope(scope, closure);

  return scope;
};
