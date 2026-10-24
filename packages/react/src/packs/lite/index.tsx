import { PRESET_LIGHT_PLUGINS } from '@fluxdown/react-plugins/lite';
import { forwardRef, memo } from 'react';

import type { FluxdownRef } from '../raw';
import type { FluxdownLiteProps } from './type';

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

export * from '../../types';
export * from './type';

export const FluxdownLite = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownLiteProps>(function FluxdownLite(
    { plugins, ...props },
    ref,
  ) {
    const merged = useMergePlugins(PRESET_LIGHT_PLUGINS, plugins);

    return <FluxdownRaw {...props} plugins={merged} ref={ref} />;
  }),
  isPropsEqual,
);
