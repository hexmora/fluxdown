import type { ComponentType } from 'react';

import { get, has, isEqual, keys } from 'lodash-es';
import { createElement, memo } from 'react';

import type { SlotInputProps, SlotType } from '../type';

import { SlotRenderer } from '../components';

const isSlotPropsEqual = (left: object, right: object): boolean => {
  if (left === right) {
    return true;
  }

  const leftKeys = keys(left);

  if (leftKeys.length !== keys(right).length) {
    return false;
  }

  for (const key of leftKeys) {
    if (!has(right, key)) {
      return false;
    }

    if (key === 'style') {
      if (!isEqual(get(left, key), get(right, key))) {
        return false;
      }
    } else if (get(left, key) !== get(right, key)) {
      return false;
    }
  }

  return true;
};

export const createTypeOfSlot = <
  T extends SlotType,
  Props extends SlotInputProps<T> = SlotInputProps<T>,
>(
  type: T,
): ComponentType<Props> => {
  const TypeOfSlot = (props: Props) => createElement(SlotRenderer, { props, type });

  TypeOfSlot.displayName = `FluxdownTypeOfSlot(${type})`;

  return memo<Props>(TypeOfSlot, isSlotPropsEqual);
};
