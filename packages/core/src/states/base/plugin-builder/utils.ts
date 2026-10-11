import { isArray, isObject } from 'lodash-es';

const isLocalConfigEqual = (
  left: unknown,
  right: unknown,
  comparison: { private: boolean },
  ancestors: object[] = [],
): boolean => {
  if (!isObject(left) || !isObject(right)) {
    return Object.is(left, right);
  }

  if (isArray(left) !== isArray(right)) {
    return false;
  }

  try {
    const leftPrototype = Object.getPrototypeOf(left);

    const rightPrototype = Object.getPrototypeOf(right);

    if (
      (isArray(left)
        ? leftPrototype !== Array.prototype || rightPrototype !== Array.prototype
        : (leftPrototype !== Object.prototype && leftPrototype !== null) ||
          (rightPrototype !== Object.prototype && rightPrototype !== null)) ||
      ancestors.includes(left) ||
      ancestors.includes(right)
    ) {
      comparison.private = true;

      return left === right;
    }

    const keys = Reflect.ownKeys(left);

    if (keys.length !== Reflect.ownKeys(right).length) {
      return false;
    }

    const path = [...ancestors, left, right];

    return keys.every((key) => {
      const a = Object.getOwnPropertyDescriptor(left, key);

      const b = Object.getOwnPropertyDescriptor(right, key);

      if (!a || !b) {
        return false;
      }

      if (!('value' in a) || !('value' in b)) {
        comparison.private = true;

        return left === right;
      }

      return isLocalConfigEqual(a.value, b.value, comparison, path);
    });
  } catch {
    return false;
  }
};

/** Retains identity-based local inputs; structural configurations use the store's snapshots. */
export const isPrivatePluggableEqual = <T>(
  left: T | [T, unknown],
  right: T | [T, unknown],
): boolean => {
  if (!isArray(left) || !isArray(right)) {
    return left === right;
  }

  if (left[0] !== right[0]) {
    return false;
  }

  const comparison = { private: false };

  return isLocalConfigEqual(left[1], right[1], comparison) && comparison.private;
};
