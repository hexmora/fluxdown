import type { MapperPluggable } from '@fluxdown/core';
import type { LynxRenderExtraParams } from '@fluxdown/lynx-plugins/base';
import type { PluggableConfigs, PluginSet } from '@fluxdown/types';
import type { ReactNode } from '@lynx-js/react';

import { Core, isPluggablesEqual, isPluginSetEqual } from '@fluxdown/core';
import { PRESET_MAPPER_PLUGINS } from '@fluxdown/core-plugins/presets/mapper';
import {
  getLynxProps,
  getTextStyle,
  mapTokensToStyles,
  SlotProvider,
  ThemeProvider,
  useDeferredUnmount,
  useLatestFn,
  useStateOf,
  useStatic,
  useThemeConfig,
} from '@fluxdown/lynx-plugins/base';
import { forwardRef, memo, useImperativeHandle, useMemo } from '@lynx-js/react';
import { castArray } from 'lodash-es';
import { shallowEqual } from 'shallow-equal';
import { D, render, S } from 'stative';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { RootReconciler } from '../../components';
import { EL, EO } from '../../consts';
import { RenderProvider } from '../../context';
import { usePlugins } from '../../hooks';
import { LynxRenderer } from '../../modules';
import { ensureRuntime } from '../../modules/runtime';
import styles from '../../styles/index.module.scss';
import {
  isPatchesEqual,
  isPropsEqual,
  toBuildConfig,
  toEffectMappers,
  toEffects,
  toSmoothConfig,
  toStreamingConfig,
} from './utils';

let instanceCount = 0;

if (__BACKGROUND__) {
  ensureRuntime();
}

// Keep parser dependencies out of the main-thread build, including this module.
const Renderer = __BACKGROUND__
  ? /*#__PURE__*/ memo(
      /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function RawRenderer(
        {
          text: _text,
          build: _build = EO,
          streaming = false,
          patches: _patches = EL,
          plugins: _plugins,
          className,
          style,
          theme = 'light',
          getProps: _getProps = getLynxProps,
        },
        ref,
      ) {
        const { repairEnding, smooth: _smooth, effect } = toStreamingConfig(streaming);

        const getProps = useLatestFn(_getProps);

        const themeConfig = useThemeConfig(theme);

        const rootStyle = useMemo(
          () => ({
            ...mapTokensToStyles(themeConfig.tokens),
            ...getTextStyle(themeConfig),
            backgroundColor: themeConfig.tokens.colors.bg,
            ...style,
          }),
          [style, themeConfig],
        );

        const effects = toEffectMappers(toEffects(effect), PRESET_MAPPER_PLUGINS);

        const idPrefix = useStatic(() => `fluxdown-lynx-${++instanceCount}`);

        const build = useStateOf(
          toBuildConfig({ base: _build, repairEnding, idPrefix }),
          shallowEqual,
        );

        const smooth = toSmoothConfig(_smooth);

        const patches = useStateOf(_patches, isPatchesEqual);

        const text = useStateOf(_text);

        const plugins = useMemo(() => castArray(_plugins), [_plugins]);

        const remarkPlugins = usePlugins(plugins, 'remarks');

        const rehypePlugins = usePlugins(plugins, 'rehypes');

        const repairPlugins = usePlugins(plugins, 'repairs');

        const mapperPlugins = usePlugins(plugins, 'mappers');

        const renderPlugins = usePlugins(plugins, 'renders');

        const slots = usePlugins(plugins, 'slots');

        const remarks = useStateOf(remarkPlugins, isPluggablesEqual);

        const rehypes = useStateOf(rehypePlugins, isPluggablesEqual);

        const repairs = useStateOf(repairPlugins, isPluggablesEqual);

        const mappers = useStateOf<PluginSet<MapperPluggable, PluggableConfigs<MapperConfigs>>>(
          [[...mapperPlugins, ...effects], { smooth }],
          isPluginSetEqual,
        );

        const renders = useStateOf(renderPlugins, isPluggablesEqual);

        const core = useStatic(() =>
          render(
            S([
              Core<ReactNode, LynxRenderExtraParams>,
              {
                Renderer: D(LynxRenderer),
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
          <ThemeProvider value={themeConfig}>
            <view
              className={[styles.root, 'fluxdown', className].filter(Boolean).join(' ')}
              style={rootStyle}
            >
              <SlotProvider plugins={slots}>
                <RenderProvider value={{ getProps }}>
                  <RootReconciler>{core.value}</RootReconciler>
                </RenderProvider>
              </SlotProvider>
            </view>
          </ThemeProvider>
        );
      }),
      isPropsEqual,
    )
  : () => null;

export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(
  function FluxdownRaw(props, ref) {
    return (
      <background-only>
        <Renderer {...props} ref={ref} />
      </background-only>
    );
  },
);
