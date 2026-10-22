import type { MapperPluggable } from '@fluxdown/core';
import type { ReactRenderExtraParams } from '@fluxdown/react-presets/base';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { ReactNode } from 'react';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-presets/presets/mapper';
import {
  SlotProvider,
  useDeferredUnmount,
  useStateOf,
  useStatic,
} from '@fluxdown/react-presets/base';
import cn from 'classnames';
import { castArray } from 'lodash-es';
import { forwardRef, memo, useId, useImperativeHandle, useMemo } from 'react';
import { shallowEqual } from 'shallow-equal';
import { D, render, S } from 'stative';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { RootReconciler } from '../../components';
import { EL, EO } from '../../consts';
import { usePlugins } from '../../hooks';
import { ReactRenderer } from '../../modules';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';
import {
  isPatchesEqual,
  isPropsEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from './utils';

export * from '../../types';
export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    {
      className,
      style,
      theme = 'light',
      text: _text,
      build: _build = EO,
      streaming = false,
      patches: _patches = EL,
      plugins: _plugins,
    },
    ref,
  ) {
    const { repairEnding, smooth: _smooth, effect } = toStreamingConfig(streaming);

    const themeStyles = useThemeStyles(theme);

    const effects = toEffectMappers(toEffects(effect), PRESET_MAPPER_PLUGINS);

    const idPrefix = useId();

    const build = useStateOf(toBuildConfig({ base: _build, repairEnding, idPrefix }), shallowEqual);

    const smooth = toSmoothConfig(_smooth);

    const patches = useStateOf(_patches, isPatchesEqual);

    const text = useStateOf(_text);

    const plugins = useMemo(() => castArray(_plugins), [_plugins]);

    const _remarks = usePlugins(plugins, 'remarks');

    const _rehypes = usePlugins(plugins, 'rehypes');

    const _repairs = usePlugins(plugins, 'repairs');

    const _mappers = usePlugins(plugins, 'mappers');

    const _renders = usePlugins(plugins, 'renders');

    const slots = usePlugins(plugins, 'slots');

    const remarks = useStateOf(_remarks, isPluggablesEqual);

    const rehypes = useStateOf(_rehypes, isPluggablesEqual);

    const repairs = useStateOf(_repairs, isPluggablesEqual);

    const mappers = useStateOf<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(
      [[..._mappers, ...effects], { smooth }],
      isPluginSetEqual,
    );

    const renders = useStateOf(_renders, isPluggablesEqual);

    const core = useStatic(() =>
      render(
        S([
          Core<ReactNode, ReactRenderExtraParams>,
          {
            Renderer: D(ReactRenderer),
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
      ),
    );

    useImperativeHandle(ref, () => core, [core]);

    useDeferredUnmount(() => core.destroy());

    return (
      <SlotProvider plugins={slots}>
        <RootReconciler className={cn(styles.root, className)} style={{ ...themeStyles, ...style }}>
          {core.value}
        </RootReconciler>
      </SlotProvider>
    );
  }),
  isPropsEqual,
);
