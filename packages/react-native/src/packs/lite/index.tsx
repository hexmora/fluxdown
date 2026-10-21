import { useMergePlugins } from '@fluxdown/react-base';
import { PRESET_LIGHT_PLUGINS } from '@fluxdown/react-native-presets/lite';
import { forwardRef, memo } from 'react';

import type { FluxdownLiteProps, FluxdownRef } from '../../types';

import { isPropsEqual } from '../../utils/compare';
import { FluxdownRaw } from '../raw';

export * from '../../types';

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
