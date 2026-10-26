import { PRESET_LITE_PLUGINS } from '@fluxdown/lynx-plugins/lite';
import { forwardRef, memo } from '@lynx-js/react';

import type { FluxdownRef } from '../raw';
import type { FluxdownLiteProps } from './type';

import { useMergePlugins } from '../../hooks';
import { FluxdownRaw, isPropsEqual } from '../raw';

// Keep parser dependencies out of the main-thread build, including this module.
const Renderer = __BACKGROUND__
  ? /*#__PURE__*/ memo(
      /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownLiteProps>(function LiteRenderer(
        { plugins, ...props },
        ref,
      ) {
        const merged = useMergePlugins(PRESET_LITE_PLUGINS, plugins);

        return <FluxdownRaw {...props} plugins={merged} ref={ref} />;
      }),
      isPropsEqual,
    )
  : () => null;

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRawProps,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '../raw';

export * from './type';

export const FluxdownLite = /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownLiteProps>(
  function FluxdownLite(props, ref) {
    return (
      <background-only>
        <Renderer {...props} ref={ref} />
      </background-only>
    );
  },
);
