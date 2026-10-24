import type { ComponentType } from 'react';

import { get, has, isPlainObject, keys } from 'lodash-es';
import { createElement, memo } from 'react';
import { shallowEqual } from 'shallow-equal';

import type { SlotInputProps, SlotType } from '../type';

import { SlotRenderer } from '../components';

const isSlotPropsEqual = (left: object, right: object): boolean => {
  if (left === right) {
    return true;
  }

  const leftKeys = keys(left);

  const rightKeys = keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (!has(right, key)) {
      return false;
    }

    const leftValue = get(left, key);

    const rightValue = get(right, key);

    if (isPlainObject(leftValue) && isPlainObject(rightValue)) {
      if (!shallowEqual(leftValue, rightValue)) {
        return false;
      }

      continue;
    }

    if (leftValue !== rightValue) {
      return false;
    }
  }

  return true;
};

export const createTypeOfSlot = <T extends SlotType>(type: T): ComponentType<SlotInputProps<T>> => {
  const TypeOfSlot = (props: SlotInputProps<T>) => createElement(SlotRenderer, { props, type });

  TypeOfSlot.displayName = `FluxdownTypeOfSlot(${type})`;

  return memo<SlotInputProps<T>>(TypeOfSlot, isSlotPropsEqual);
};
