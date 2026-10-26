import type { ComponentType } from '@lynx-js/react';

import { createElement, memo } from '@lynx-js/react';
import { get, has, isPlainObject, keys } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { SlotRendererProps } from '../components';
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
  // Erase the slot union inside memo; expanding every native event prop exceeds TypeScript's union limit.
  const TypeOfSlot = (props: object) =>
    createElement<SlotRendererProps>(SlotRenderer, { props: props as SlotInputProps, type });

  TypeOfSlot.displayName = `FluxdownTypeOfSlot(${type})`;

  return memo(TypeOfSlot, isSlotPropsEqual) as unknown as ComponentType<SlotInputProps<T>>;
};
