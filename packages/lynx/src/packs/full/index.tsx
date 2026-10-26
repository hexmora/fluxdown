import { PRESET_FULL_PLUGINS } from '@fluxdown/lynx-plugins/full';
import { forwardRef, memo } from '@lynx-js/react';

import type { FluxdownRef } from '../raw';
import type { FluxdownProps } from './type';

import { useMergePlugins } from '../../hooks';
import { FluxdownRaw, isPropsEqual } from '../raw';

// Keep parser dependencies out of the main-thread build, including this module.
const Renderer = __BACKGROUND__
  ? /*#__PURE__*/ memo(
      /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(function FullRenderer(
        { plugins, ...props },
        ref,
      ) {
        const merged = useMergePlugins(PRESET_FULL_PLUGINS, plugins);

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

export const Fluxdown = /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(
  function Fluxdown(props, ref) {
    return (
      <background-only>
        <Renderer {...props} ref={ref} />
      </background-only>
    );
  },
);
