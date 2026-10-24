import type { PartialBy } from '@fluxdown/utils';

import { isPluggablesEqual, isPluginConfigEqual } from '@fluxdown/core';
import { isPluginItemsEqual } from '@fluxdown/react-base-plugins/base';
import { shallowEqual } from 'shallow-equal';

import type { FluxdownBaseProps } from '../type';

import { EL, EO } from '../../consts';
import { toStreamingConfig } from './config';
import { toEffects } from './effect';
import { isPatchesEqual } from './patches';

type ComparableProps = PartialBy<FluxdownBaseProps, 'plugins'>;

export const isPropsEqual = (left: ComparableProps, right: ComparableProps): boolean => {
  if (left === right) {
    return true;
  }

  const leftStreaming = toStreamingConfig(left.streaming);

  const rightStreaming = toStreamingConfig(right.streaming);

  return [
    left.text === right.text,
    left.getProps === right.getProps,
    shallowEqual(left.build ?? EO, right.build ?? EO),
    leftStreaming.repairEnding === rightStreaming.repairEnding,
    isPluginConfigEqual(leftStreaming.smooth, rightStreaming.smooth),
    isPluggablesEqual(toEffects(leftStreaming.effect), toEffects(rightStreaming.effect)),
    isPatchesEqual(left.patches ?? EL, right.patches ?? EL),
    isPluginItemsEqual(left.plugins, right.plugins),
  ].every((item) => item);
};
