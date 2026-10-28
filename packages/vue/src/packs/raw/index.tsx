import type { MapperPluggable } from '@fluxdown/core';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { VueRenderExtraParams } from '@fluxdown/vue-plugins/base';
import type { VNodeChild } from 'vue';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { getVueProps, SlotProvider, useStateOf } from '@fluxdown/vue-plugins/base';
import { castArray } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { D, render, S } from 'stative';
import { computed, defineComponent, onScopeDispose, useId } from 'vue';

import type { FluxdownRawProps } from './type';

import { RootReconciler } from '../../components';
import { EL, EO, ROOT_CLASS_NAME } from '../../consts';
import { provideRender } from '../../context';
import { usePlugins } from '../../hooks';
import { VueRenderer } from '../../modules';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';
import {
  isPatchesEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from '../utils';

export * from '../../types';
export * from './type';

export const FluxdownRaw = /*#__PURE__*/ defineComponent(
  (props: FluxdownRawProps, { attrs, expose }) => {
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

    const _remarks = usePlugins(() => plugins.value, 'remarks');

    const _rehypes = usePlugins(() => plugins.value, 'rehypes');

    const _repairs = usePlugins(() => plugins.value, 'repairs');

    const _mappers = usePlugins(() => plugins.value, 'mappers');

    const _renders = usePlugins(() => plugins.value, 'renders');

    const slots = usePlugins(() => plugins.value, 'slots');

    const remarks = useStateOf(() => _remarks.value, isPluggablesEqual);

    const rehypes = useStateOf(() => _rehypes.value, isPluggablesEqual);

    const repairs = useStateOf(() => _repairs.value, isPluggablesEqual);

    const mappers = useStateOf<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(
      () => [
        [..._mappers.value, ...effects.value],
        { smooth: toSmoothConfig(streaming.value.smooth) },
      ],
      isPluginSetEqual,
    );

    const renders = useStateOf(() => _renders.value, isPluggablesEqual);

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

    const theme = useThemeStyles(() => props.theme ?? 'light');

    provideRender({ getProps: getVueProps });

    expose(core);

    onScopeDispose(() => core.destroy());

    return () => {
      const { class: className, style, ...elementAttrs } = attrs;

      return (
        <div
          {...elementAttrs}
          class={[styles.root, ROOT_CLASS_NAME, className]}
          style={[theme.value, style]}
        >
          <SlotProvider plugins={slots.value}>
            {{ default: () => <RootReconciler value={core.value} /> }}
          </SlotProvider>
        </div>
      );
    };
  },
  {
    name: 'FluxdownRaw',
    props: ['text', 'build', 'streaming', 'patches', 'plugins', 'theme'],
    inheritAttrs: false,
  },
);
