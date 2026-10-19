import { isPluggablesEqual, isPluginConfigEqual } from '@fluxdown/core';
import { castArray, every, isEqual } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';

import type { FluxdownProps, IPluginItem } from '../types';

import { EL, EO } from '../consts';
import { toStreamingConfig } from './config';
import { toEffects } from './effect';
import { isPatchesEqual } from './patches';

const isPluginItemEqual = (left: IPluginItem, right: IPluginItem): boolean => {
  return (
    left === right ||
    (isPluginConfigEqual(left.config ?? {}, right.config ?? {}) &&
      isPluggablesEqual(left.remarks, right.remarks) &&
      isPluggablesEqual(left.rehypes, right.rehypes) &&
      isPluggablesEqual(left.repairs, right.repairs) &&
      isPluggablesEqual(left.mappers, right.mappers) &&
      isPluggablesEqual(left.renders, right.renders) &&
      isPluggablesEqual(left.slots, right.slots))
  );
};

const isPluginItemsEqual = (
  left: IPluginItem | IPluginItem[] = EL,
  right: IPluginItem | IPluginItem[] = EL,
): boolean => {
  if (left === right) {
    return true;
  }

  const leftItems = castArray(left);
  const rightItems = castArray(right);

  return (
    leftItems.length === rightItems.length &&
    every(leftItems, (item, index) => {
      const other = rightItems[index];

      return item !== undefined && other !== undefined && isPluginItemEqual(item, other);
    })
  );
};

export const isPropsEqual = (
  left: Readonly<FluxdownProps>,
  right: Readonly<FluxdownProps>,
): boolean => {
  if (left === right) {
    return true;
  }

  const leftStreaming = toStreamingConfig(left.streaming);

  const rightStreaming = toStreamingConfig(right.streaming);

  return [
    left.text === right.text,
    left.className === right.className,
    shallowEqual(left.style ?? EO, right.style ?? EO),
    isEqual(left.theme ?? 'light', right.theme ?? 'light'),
    shallowEqual(left.build ?? EO, right.build ?? EO),
    leftStreaming.repairEnding === rightStreaming.repairEnding,
    isPluginConfigEqual(leftStreaming.smooth, rightStreaming.smooth),
    isPluggablesEqual(toEffects(leftStreaming.effect), toEffects(rightStreaming.effect)),
    isPatchesEqual(left.patches ?? EL, right.patches ?? EL),
    isPluginItemsEqual(left.plugins, right.plugins),
  ].every((item) => item);
};
