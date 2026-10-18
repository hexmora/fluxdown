import { useMergePlugins } from '@fluxdown/react-base';
import { PRESET_FULL_PLUGINS } from '@fluxdown/react-native-presets/full';
import { forwardRef, memo } from 'react';

import type { FluxdownProps, FluxdownRef } from '../../types';

import { isPropsEqual } from '../../utils/compare';
import { FluxdownRaw } from '../raw';

export * from '../../types';

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
