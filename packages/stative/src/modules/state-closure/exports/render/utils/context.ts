import { isFunction } from 'lodash-es';
import { UnsubscriptionError } from 'rxjs';

import type { IReadableClosure } from '../../../type';

type Cleanup = () => void;

type Cleanups = Cleanup | Cleanup[] | null;

export type DescriptorScope = {
  detached: boolean;
  destroyed: boolean;
  closures: Set<IReadableClosure<unknown>> | null;
  detachers: Cleanups;
  resources: Cleanups;
};

type ClosureContext = {
  scope: DescriptorScope | null;
  owners: Set<DescriptorScope> | null;
  originalDestroy: (() => void) | null;
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

  const context: ClosureContext = { scope: null, owners: null, originalDestroy: null };

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

export const destroyDescriptorScope = (
  scope: DescriptorScope,
  destroy?: () => void,
  receiver?: IReadableClosure<unknown>,
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

function destroyReadableClosure(this: IReadableClosure<unknown>) {
  const context = getClosureContext(this);

  destroyDescriptorScope(context.scope!, context.originalDestroy!, this);
}

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

export const getReadableClosureScope = (closure: IReadableClosure<unknown>): DescriptorScope => {
  const { scope: current } = getClosureContext(closure);

  if (current) {
    return current;
  }

  const scope = createDescriptorScope();

  bindRootDescriptorScope(scope, closure);

  return scope;
};
