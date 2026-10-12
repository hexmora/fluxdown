import {
  forOwn,
  identity,
  isArray,
  isFunction,
  isObject,
  isPlainObject,
  mapValues,
} from 'lodash-es';

import type { DescriptorScope } from '../../../__internal__';
import type { ResolvedMappingNode, RuntimeSlottedDescriptor } from '../../exports';
import type { IReadableClosure } from '../../type';

import {
  assertDescriptorScope,
  bindRootDescriptorScope,
  createDescriptorScope,
  DescriptorContext,
  destroyDescriptorScope,
  immediateDescriptor,
  isClass,
  isMarkedStateClosureDescriptor,
  isReactiveStateLike,
  ownReadableClosure,
} from '../../../__internal__';
import { toClosure } from '../../main';
import { StateClosureHookRuntime } from '../hook-runtime';
import { isOnceFunction } from '../once';
import { createMappedStateClosure } from './mapped';
import {
  isImmediateDescriptor,
  isReadableClosure,
  isReadableSourceDescriptor,
  isSlottedDescriptor,
  unwrapImmediateDescriptor,
} from './predicates';

const generatorTarget = /*#__PURE__*/ Symbol('generatorTarget');

type StateClosureGenerator = ((...params: unknown[]) => unknown) & {
  readonly [generatorTarget]?: StateClosureGenerator;
};

const resolveReadableSource = (
  source: unknown,
  scope: DescriptorScope,
): IReadableClosure<unknown> => {
  assertDescriptorScope(scope);

  if (isReadableSourceDescriptor(source)) {
    return buildStateClosure(source, scope, false);
  }

  const value = isReactiveStateLike(source) ? source : { [immediateDescriptor]: source };

  return ownReadableClosure(scope, toClosure<unknown>(value));
};

const resolveGenerator = (generator: StateClosureGenerator, scope: DescriptorScope) => {
  const target = generator[generatorTarget] ?? generator;

  const resolved: StateClosureGenerator = (...params) => {
    assertDescriptorScope(scope);

    const source = StateClosureHookRuntime.run(null, () => target(...params));

    return resolveReadableSource(source, scope);
  };

  Object.defineProperty(resolved, generatorTarget, { value: target });

  return resolved;
};

const readMappingNode = (node: ResolvedMappingNode): unknown => {
  switch (node.type) {
    case 'constant':
      return node.value;
    case 'state':
      return node.closure.value.value;
    case 'array':
      return node.items.map(readMappingNode);
    case 'object':
      return mapValues(node.props, readMappingNode);
  }
};

const resolveMappingNode = (
  descriptor: unknown,
  scope: DescriptorScope,
  dependencies: IReadableClosure<unknown>[],
): ResolvedMappingNode => {
  if (isImmediateDescriptor(descriptor)) {
    return { type: 'constant', value: unwrapImmediateDescriptor(descriptor) };
  }

  if (isReactiveStateLike(descriptor) || isReadableSourceDescriptor(descriptor)) {
    const closure = resolveReadableSource(descriptor, scope);

    if (!dependencies.includes(closure)) {
      dependencies.push(closure);
    }

    return { type: 'state', closure };
  }

  if (isArray(descriptor)) {
    return {
      type: 'array',
      items: descriptor.map((item) => resolveMappingNode(item, scope, dependencies)),
    };
  }

  if (!isObject(descriptor)) {
    return { type: 'constant', value: descriptor };
  }

  if (isPlainObject(descriptor)) {
    const props: Record<string, ResolvedMappingNode> = {};

    forOwn(descriptor, (item, key) => {
      props[key] = resolveMappingNode(item, scope, dependencies);
    });

    return { type: 'object', props };
  }

  throw new TypeError('Invalid mapper input. Wrap static objects and callbacks with D().');
};

const resolveStateClosureInput = (descriptor: unknown, scope: DescriptorScope): unknown => {
  if (isImmediateDescriptor(descriptor)) {
    return unwrapImmediateDescriptor(descriptor);
  }

  if (!isObject(descriptor)) {
    return descriptor;
  }

  if (isFunction(descriptor) && !isClass(descriptor)) {
    return resolveGenerator(descriptor, scope);
  }

  return resolveReadableSource(descriptor, scope);
};

const resolveStateClosureInputs = (
  descriptor: unknown,
  scope: DescriptorScope,
  allowObjectProps: boolean,
): unknown => {
  if (isImmediateDescriptor(descriptor)) {
    return unwrapImmediateDescriptor(descriptor);
  }

  if (!isObject(descriptor)) {
    return descriptor;
  }

  if (
    (isPlainObject(descriptor) ||
      (allowObjectProps && !isArray(descriptor) && !isFunction(descriptor))) &&
    !isReactiveStateLike(descriptor) &&
    !isReadableClosure(descriptor)
  ) {
    return mapValues(descriptor, (item) => resolveStateClosureInput(item, scope));
  }

  return resolveStateClosureInput(descriptor, scope);
};

const buildSlottedStateClosure = (
  descriptor: RuntimeSlottedDescriptor,
  scope: DescriptorScope,
): IReadableClosure<unknown> => {
  const [Factory, params, distinctor] = descriptor;

  if (isClass(Factory)) {
    const inputs = resolveStateClosureInputs(
      params,
      scope,
      isMarkedStateClosureDescriptor(descriptor),
    );

    return DescriptorContext.run(scope, () =>
      StateClosureHookRuntime.run(null, () => new Factory(inputs)),
    );
  }

  if (isOnceFunction(Factory)) {
    const inputs = resolveStateClosureInputs(
      params,
      scope,
      isMarkedStateClosureDescriptor(descriptor),
    );

    return DescriptorContext.run(scope, () =>
      createMappedStateClosure(Factory, () => inputs, [], 'once'),
    );
  }

  const dependencies: IReadableClosure<unknown>[] = [];

  const node = resolveMappingNode(params, scope, dependencies);

  return DescriptorContext.run(scope, () =>
    createMappedStateClosure(
      Factory,
      () => readMappingNode(node),
      dependencies,
      'mapper',
      distinctor,
    ),
  );
};

/** Resolves class and once inputs without reading their reactive values. */
export const resolveDescriptor = (descriptor: unknown, scope: DescriptorScope): unknown => {
  return resolveStateClosureInputs(descriptor, scope, false);
};

export const buildStateClosure = (
  descriptor: unknown,
  scope: DescriptorScope,
  root: boolean,
): IReadableClosure<unknown> => {
  assertDescriptorScope(scope);

  if (isReadableClosure(descriptor)) {
    return root ? descriptor : ownReadableClosure(scope, descriptor);
  }

  const closureScope = root ? scope : createDescriptorScope();

  try {
    let closure: IReadableClosure<unknown>;

    if (
      descriptor === null ||
      isImmediateDescriptor(descriptor) ||
      isReactiveStateLike(descriptor)
    ) {
      closure = DescriptorContext.run(closureScope, () => toClosure(descriptor));
    } else if (isSlottedDescriptor(descriptor)) {
      closure = buildSlottedStateClosure(descriptor, closureScope);
    } else if (isClass(descriptor)) {
      closure = DescriptorContext.run(closureScope, () =>
        StateClosureHookRuntime.run(null, () => new descriptor()),
      );
    } else {
      const dependencies: IReadableClosure<unknown>[] = [];

      const node = resolveMappingNode(descriptor, closureScope, dependencies);

      closure = DescriptorContext.run(closureScope, () =>
        createMappedStateClosure(identity, () => readMappingNode(node), dependencies, 'mapper'),
      );
    }

    bindRootDescriptorScope(closureScope, closure);

    return root ? closure : ownReadableClosure(scope, closure);
  } catch (error) {
    destroyDescriptorScope(closureScope);

    throw error;
  }
};
