import { PRESET_FULL_PLUGINS } from '@fluxdown/react-native-plugins/full';
import { forwardRef, memo } from 'react';

import type { FluxdownRef } from '../raw';
import type { FluxdownProps } from './type';

import { useMergePlugins } from '../../hooks';
import { FluxdownRaw, isPropsEqual } from '../raw';

export type {
  BaseBuildConfig,
  EffectItem,
  FluxdownRawProps,
  FluxdownRef,
  SmoothConfig,
  StreamingConfig,
} from '../raw';

export * from './type';

export const Fluxdown = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(function Fluxdown(
    { plugins, ...props },
    ref,
  ) {
    const merged = useMergePlugins(PRESET_FULL_PLUGINS, plugins);

    return <FluxdownRaw {...props} plugins={merged} ref={ref} />;
  }),
  isPropsEqual,
);
