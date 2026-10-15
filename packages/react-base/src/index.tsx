import type { MapperPluggable } from '@fluxdown/core';
import type { ReactRenderExtraParams } from '@fluxdown/react-base-presets/base';
import type { PluginSet } from '@fluxdown/types';
import type { ReactNode } from 'react';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import {
  SlotProvider,
  useDeferredUnmount,
  useStateOf,
  useStatic,
} from '@fluxdown/react-base-presets/base';
import { PRESET_RENDER_PLUGINS } from '@fluxdown/react-base-presets/render';
import { forwardRef, memo, useId, useImperativeHandle } from 'react';
import { shallowEqual } from 'shallow-equal';
import { D, render, S } from 'stative';

import type { BaseFluxdownProps, BaseFluxdownRef } from './types';

import { RootReconciler } from './components';
import { EL, EO } from './consts';
import { usePluginConfig, usePlugins } from './hooks';
import { ReactRenderer } from './modules';
import {
  isPatchesEqual,
  isPropsEqual,
  toBuildConfig,
  toShadConfig,
  toSmoothConfig,
  toStreamingConfig,
} from './utils';

export * from './types';

export const BaseFluxdown = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<BaseFluxdownRef, BaseFluxdownProps>(function BaseFluxdown(
    {
      text: _text,
      build: _build = EO,
      streaming = false,
      patches: _patches = EL,
      plugins: _plugins = EL,
    },
    ref,
  ) {
    const { repairEnding, smooth: _smooth, shad: _shad } = toStreamingConfig(streaming);

    const idPrefix = useId();

    const build = useStateOf(toBuildConfig({ base: _build, repairEnding, idPrefix }), shallowEqual);

    const smooth = usePluginConfig(toSmoothConfig(_smooth));

    const shad = usePluginConfig(toShadConfig(_shad));

    const patches = useStateOf(_patches, isPatchesEqual);

    const text = useStateOf(_text);

    const _remarks = usePlugins(_plugins, 'remarks');

    const _rehypes = usePlugins(_plugins, 'rehypes');

    const _repairs = usePlugins(_plugins, 'repairs');

    const _mappers = usePlugins(_plugins, 'mappers');

    const _renders = usePlugins(_plugins, 'renders', PRESET_RENDER_PLUGINS);

    const slots = usePlugins(_plugins, 'slots');

    const remarks = useStateOf(_remarks, isPluggablesEqual);

    const rehypes = useStateOf(_rehypes, isPluggablesEqual);

    const repairs = useStateOf(_repairs, isPluggablesEqual);

    const mappers = useStateOf<PluginSet<MapperPluggable, MapperConfigs>>(
      [_mappers, { smooth, shad }],
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
        <RootReconciler>{core.value}</RootReconciler>
      </SlotProvider>
    );
  }),
  isPropsEqual,
);
