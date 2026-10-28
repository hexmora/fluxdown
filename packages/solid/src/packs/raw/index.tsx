import type { MapperPluggable } from '@fluxdown/core';
import type { SolidRenderExtraParams } from '@fluxdown/solid-plugins/base';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { JSX } from 'solid-js';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import { createStateOf, getSolidProps, SlotProvider } from '@fluxdown/solid-plugins/base';
import { castArray } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { createMemo, createUniqueId, onCleanup, splitProps } from 'solid-js';
import { D, render, S } from 'stative';

import type { FluxdownRawProps } from './type';

import { RootReconciler } from '../../components';
import { EL, EO, ROOT_CLASS_NAME } from '../../consts';
import { RenderProvider } from '../../context';
import { createPlugins } from '../../hooks';
import { SolidRenderer } from '../../modules';
import styles from '../../styles/index.module.scss';
import { createThemeStyles } from '../../theme';
import {
  isPatchesEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from '../utils';
import { mergeStyles } from './utils';

export * from '../../types';
export * from './type';

export const FluxdownRaw = (props: FluxdownRawProps) => {
  const [options, attributes] = splitProps(props, [
    'text',
    'build',
    'streaming',
    'patches',
    'plugins',
    'theme',
    'class',
    'style',
    'ref',
  ]);

  const streaming = createMemo(() => toStreamingConfig(options.streaming));

  const effects = createMemo(() =>
    toEffectMappers(toEffects(streaming().effect), PRESET_MAPPER_PLUGINS),
  );

  const idPrefix = createUniqueId();

  const build = createStateOf(
    () =>
      toBuildConfig({
        base: options.build ?? EO,
        repairEnding: streaming().repairEnding,
        idPrefix,
      }),
    shallowEqual,
  );

  const patches = createStateOf(() => options.patches ?? EL, isPatchesEqual);

  const text = createStateOf(() => options.text);

  const plugins = createMemo(() => castArray(options.plugins));

  const _remarks = createPlugins(plugins, 'remarks');

  const _rehypes = createPlugins(plugins, 'rehypes');

  const _repairs = createPlugins(plugins, 'repairs');

  const _mappers = createPlugins(plugins, 'mappers');

  const _renders = createPlugins(plugins, 'renders');

  const slots = createPlugins(plugins, 'slots');

  const remarks = createStateOf(_remarks, isPluggablesEqual);

  const rehypes = createStateOf(_rehypes, isPluggablesEqual);

  const repairs = createStateOf(_repairs, isPluggablesEqual);

  const mappers = createStateOf<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(
    () => [[..._mappers(), ...effects()], { smooth: toSmoothConfig(streaming().smooth) }],
    isPluginSetEqual,
  );

  const renders = createStateOf(_renders, isPluggablesEqual);

  const core = render(
    S([
      Core<JSX.Element, SolidRenderExtraParams>,
      {
        Renderer: D(SolidRenderer),
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

  const theme = createThemeStyles(() => options.theme ?? 'light');

  options.ref?.(core);

  onCleanup(() => core.destroy());

  return (
    <div
      {...attributes}
      class={[styles.root, ROOT_CLASS_NAME, options.class].filter(Boolean).join(' ')}
      style={mergeStyles(theme(), options.style)}
    >
      <RenderProvider value={{ getProps: getSolidProps }}>
        <SlotProvider plugins={slots()}>
          <RootReconciler value={core.value} />
        </SlotProvider>
      </RenderProvider>
    </div>
  );
};
