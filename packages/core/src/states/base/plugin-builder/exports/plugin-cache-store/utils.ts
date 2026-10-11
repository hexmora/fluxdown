import { isArray } from 'lodash-es';

import type { PluginConfigSnapshot } from './type';

const getComparison = (value: object): ((other: unknown) => boolean) | undefined => {
  let current: object | null = value;

  const ancestors: object[] = [];

  while (current && !ancestors.includes(current)) {
    ancestors.push(current);

    const descriptor = Object.getOwnPropertyDescriptor(current, 'isPluginConfigEqual');

    if (descriptor) {
      return 'value' in descriptor && typeof descriptor.value === 'function'
        ? descriptor.value
        : undefined;
    }

    current = Object.getPrototypeOf(current);
  }

  return undefined;
};

export const getSnapshot = (
  value: unknown,
  ancestors: object[] = [],
  cycles: object[] = [],
): PluginConfigSnapshot => {
  if (value === null || typeof value !== 'object') {
    return { kind: 'value', value };
  }

  try {
    const prototype: object | null = Object.getPrototypeOf(value);

    const compare = getComparison(value);

    if (compare) {
      return { kind: 'comparable', value, prototype, compare };
    }

    const array = isArray(value);

    if (
      array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null
    ) {
      return { kind: 'value', value };
    }

    const cycle = ancestors.indexOf(value);

    if (cycle !== -1) {
      cycles.push(...ancestors.slice(cycle));

      return { kind: 'value', value };
    }

    const properties = new Map<PropertyKey, PluginConfigSnapshot>();

    const path = [...ancestors, value];

    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (!descriptor || !('value' in descriptor)) {
        return { kind: 'value', value };
      }

      properties.set(key, getSnapshot(descriptor.value, path, cycles));
    }

    return cycles.includes(value)
      ? { kind: 'value', value }
      : { kind: array ? 'array' : 'record', value, properties };
  } catch {
    return { kind: 'value', value };
  }
};

export const isConfigEqual = (
  left: PluginConfigSnapshot | undefined,
  right: PluginConfigSnapshot | undefined,
): boolean => {
  if (!left || !right) {
    return left === right;
  }

  if (Object.is(left.value, right.value)) {
    return true;
  }

  if (left.kind === 'value') {
    return false;
  }

  if (left.kind === 'comparable') {
    if (right.kind !== 'comparable' || left.prototype !== right.prototype) {
      return false;
    }

    try {
      return (
        left.compare.call(left.value, right.value) === true &&
        right.compare.call(right.value, left.value) === true
      );
    } catch {
      return false;
    }
  }

  if (right.kind !== left.kind || left.properties.size !== right.properties.size) {
    return false;
  }

  for (const [key, value] of left.properties) {
    if (!right.properties.has(key) || !isConfigEqual(value, right.properties.get(key))) {
      return false;
    }
  }

  return true;
};
