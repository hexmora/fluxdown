import { UnsubscriptionError } from 'rxjs';

import type { IReadableClosure } from '../../../type';

export type DescriptorScope = {
  detached: boolean;
  destroyed: boolean;
  closures: Set<IReadableClosure<unknown>> | null;
  detachers: Array<() => void> | null;
  resources: Array<() => void> | null;
};

type ClosureContext = {
  scope: DescriptorScope | null;
  owners: Set<DescriptorScope> | null;
};

const closureContext = /*#__PURE__*/ Symbol('closureContext');

let constructionScope: DescriptorScope | null = null;

const getClosureContext = (
  closure: IReadableClosure<unknown> & { [closureContext]?: ClosureContext },
): ClosureContext => {
  const existing = Object.hasOwn(closure, closureContext) ? closure[closureContext] : undefined;

  if (existing) {
    return existing;
  }

  const context: ClosureContext = { scope: null, owners: null };

  Object.defineProperty(closure, closureContext, { value: context });

  return context;
};

export const withDescriptorScope = <T>(scope: DescriptorScope, callback: () => T): T => {
  const previous = constructionScope;

  constructionScope = scope;

  try {
    return callback();
  } finally {
    constructionScope = previous;
  }
};

export const consumeDescriptorScope = (): DescriptorScope | null => {
  const scope = constructionScope;

  constructionScope = null;

  return scope;
};

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
  (scope.resources ??= []).push(cleanup);
};

export const detachWithDescriptorScope = (scope: DescriptorScope, detach: () => void) => {
  (scope.detachers ??= []).push(detach);
};

export const ownReadableClosure = <T extends IReadableClosure<unknown>>(
  scope: DescriptorScope,
  closure: T,
): T => {
  if (scope.closures?.has(closure)) {
    return closure;
  }

  const context = getClosureContext(closure);

  (context.owners ??= new Set()).add(scope);

  (scope.closures ??= new Set()).add(closure);

  return closure;
};

export const releaseReadableClosure = (
  scope: DescriptorScope,
  closure: IReadableClosure<unknown>,
) => {
  if (!scope.closures?.delete(closure)) {
    return;
  }

  const { owners } = getClosureContext(closure);

  owners?.delete(scope);

  if (!owners?.size) {
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

const detachDescriptorScope = (scope: DescriptorScope) => {
  if (scope.detached) {
    return;
  }

  scope.detached = true;

  let errors: unknown[] | undefined;

  const detachers = scope.detachers;

  scope.detachers = null;

  if (detachers) {
    for (let index = detachers.length - 1; index >= 0; index--) {
      try {
        detachers[index]();
      } catch (error) {
        errors = appendCleanupError(errors, error);
      }
    }
  }

  if (scope.closures) {
    for (const closure of scope.closures) {
      try {
        const { scope: childScope, owners } = getClosureContext(closure);

        if (childScope) {
          let allDetached = true;

          if (owners) {
            for (const owner of owners) {
              if (!owner.detached) {
                allDetached = false;

                break;
              }
            }
          }

          if (allDetached) {
            detachDescriptorScope(childScope);
          }
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

export const destroyDescriptorScope = (scope: DescriptorScope, destroy?: () => void) => {
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
    destroy?.();
  } catch (error) {
    errors = appendCleanupError(errors, error);
  }

  const resources = scope.resources;

  scope.resources = null;

  if (resources) {
    for (const cleanup of resources) {
      try {
        cleanup();
      } catch (error) {
        errors = appendCleanupError(errors, error);
      }
    }
  }

  if (errors) {
    throw new UnsubscriptionError(errors);
  }
};

export const bindRootDescriptorScope = <T extends IReadableClosure<unknown>>(
  scope: DescriptorScope,
  closure: T,
): T => {
  const context = getClosureContext(closure);

  const previous = context.scope;

  if (previous === scope) {
    return closure;
  }

  if (previous) {
    if (previous.resources) {
      (scope.resources ??= []).push(...previous.resources);

      previous.resources = null;
    }

    if (previous.detachers) {
      (scope.detachers ??= []).push(...previous.detachers);

      previous.detachers = null;
    }

    if (previous.closures) {
      for (const child of previous.closures) {
        ownReadableClosure(scope, child);

        releaseReadableClosure(previous, child);
      }
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
  const { scope: current } = getClosureContext(closure);

  if (current) {
    return current;
  }

  const scope = createDescriptorScope();

  bindRootDescriptorScope(scope, closure);

  return scope;
};
