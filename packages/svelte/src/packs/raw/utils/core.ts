import type { MapperPluggable } from '@fluxdown/core';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';

import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { toPluginList } from '@fluxdown/svelte-plugins/base';
import { castArray } from 'lodash-es';

import type { FluxdownRawProps } from '../type';

import { EL, EO } from '../../../consts';
import { toBuildConfig, toSmoothConfig, toStreamingConfig } from './config';
import { toEffectMappers, toEffects } from './effect';

export const toCoreConfig = (props: FluxdownRawProps, idPrefix: string) => {
  const { repairEnding, smooth, effect } = toStreamingConfig(props.streaming);

  const plugins = castArray(props.plugins);

  const effects = toEffectMappers(toEffects(effect), PRESET_MAPPER_PLUGINS);

  const mappers: PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>> = [
    [...toPluginList(plugins, 'mappers'), ...effects],
    { smooth: toSmoothConfig(smooth) },
  ];

  return {
    text: props.text,
    build: toBuildConfig({ base: props.build ?? EO, repairEnding, idPrefix }),
    patches: props.patches ?? EL,
    remarks: toPluginList(plugins, 'remarks'),
    rehypes: toPluginList(plugins, 'rehypes'),
    repairs: toPluginList(plugins, 'repairs'),
    renders: toPluginList(plugins, 'renders'),
    slots: toPluginList(plugins, 'slots'),
    mappers,
  };
};
