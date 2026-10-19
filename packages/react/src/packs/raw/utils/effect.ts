import type { Mapper, MapperPluggable } from '@fluxdown/core';

import { assert } from '@fluxdown/utils';
import { defaults, isArray, isObjectLike, isString } from 'lodash-es';

import type { EffectItem, StreamingConfig } from '../type';

import { EO } from '../../../consts';

export const toEffects = (effect: StreamingConfig['effect'] = false): EffectItem[] => {
  if (effect === false) {
    return [];
  }

  if (effect === true) {
    return ['scale'];
  }

  if (!isArray(effect)) {
    return [effect];
  }

  if (effect.length === 2 && !isArray(effect[1]) && isObjectLike(effect[1])) {
    return [effect as EffectItem];
  }

  return effect as EffectItem[];
};

export const toEffectMappers = (effects: EffectItem[], presets: Mapper[]): MapperPluggable[] => {
  return effects.map((effect): MapperPluggable => {
    const [key, config] = isArray(effect) ? effect : [effect, EO];

    if (!isString(key)) {
      return effect as MapperPluggable;
    }

    const Mapper = presets.find((item) => item.key === key);

    assert(Mapper, `Unknown effect: ${key}`);

    return [Mapper, defaults({ ...config }, { enabled: true })];
  });
};
