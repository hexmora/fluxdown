/** @jsxImportSource vue */

import type { MapperPluggable } from '@fluxdown/core';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { VueRenderExtraParams } from '@fluxdown/vue-base-plugins/base';
import type { VNodeChild } from 'vue';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { SlotProvider, useStateOf } from '@fluxdown/vue-base-plugins/base';
import { castArray } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { D, render, S } from 'stative';
import { computed, defineComponent, onScopeDispose, useId } from 'vue';

import type { FluxdownBaseProps } from './type';

import { RootReconciler } from '../components';
import { EL, EO } from '../consts';
import { provideRender } from '../context';
import { usePlugins } from '../hooks';
import { VueRenderer } from '../modules';
import {
  isPatchesEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from './utils';

export * from './type';
export { useMergePlugins } from './utils';

export const FluxdownBase = /*#__PURE__*/ defineComponent(
  (props: FluxdownBaseProps, { expose }) => {
    const streaming = computed(() => toStreamingConfig(props.streaming));

    const effects = computed(() =>
      toEffectMappers(toEffects(streaming.value.effect), PRESET_MAPPER_PLUGINS),
    );

    const idPrefix = useId();

    const build = useStateOf(
      () =>
        toBuildConfig({
          base: props.build ?? EO,
          repairEnding: streaming.value.repairEnding,
          idPrefix,
        }),
      shallowEqual,
    );

    const patches = useStateOf(() => props.patches ?? EL, isPatchesEqual);

    const text = useStateOf(() => props.text);

    const plugins = computed(() => castArray(props.plugins));

    const remarkPlugins = usePlugins(() => plugins.value, 'remarks');

    const rehypePlugins = usePlugins(() => plugins.value, 'rehypes');

    const repairPlugins = usePlugins(() => plugins.value, 'repairs');

    const mapperPlugins = usePlugins(() => plugins.value, 'mappers');

    const renderPlugins = usePlugins(() => plugins.value, 'renders');

    const slots = usePlugins(() => plugins.value, 'slots');

    const remarks = useStateOf(() => remarkPlugins.value, isPluggablesEqual);

    const rehypes = useStateOf(() => rehypePlugins.value, isPluggablesEqual);

    const repairs = useStateOf(() => repairPlugins.value, isPluggablesEqual);

    const mappers = useStateOf<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(
      () => [
        [...mapperPlugins.value, ...effects.value],
        { smooth: toSmoothConfig(streaming.value.smooth) },
      ],
      isPluginSetEqual,
    );

    const renders = useStateOf(() => renderPlugins.value, isPluggablesEqual);

    const core = render(
      S([
        Core<VNodeChild, VueRenderExtraParams>,
        {
          Renderer: D(VueRenderer),
          build,
          patches,
          rehypes,
          remarks,
          renders,
          repairs,
          mappers,
          text,
        },
      ]),
    );

    provideRender({
      get getProps() {
        return props.getProps;
      },
    });

    expose(core);

    onScopeDispose(() => core.destroy());

    return () => {
      return (
        <SlotProvider plugins={slots.value}>
          {{ default: () => <RootReconciler value={core.value} /> }}
        </SlotProvider>
      );
    };
  },
  {
    name: 'FluxdownBase',
    props: ['text', 'build', 'streaming', 'patches', 'plugins', 'getProps'],
    inheritAttrs: false,
  },
);
