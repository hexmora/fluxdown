import { BaseFluxdown } from '@fluxdown/react-base';
import { NativeThemeProvider } from '@fluxdown/react-native-presets/base';
import { NodeSlotPlugin } from '@fluxdown/react-native-presets/plugins/fallback';
import { castArray } from 'lodash-es';
import { forwardRef, memo, useMemo } from 'react';

import type { FluxdownRawProps, FluxdownRef } from '../../types';

import { Root } from '../../components';
import { Renderer } from '../../modules';
import { isPropsEqual } from '../../utils/compare';

export * from '../../types';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    { theme, styles, selectable, text, build, streaming, patches, plugins: _plugins, ...viewProps },
    ref,
  ) {
    const plugins = useMemo(
      () => [{ slots: [NodeSlotPlugin] }, ...castArray(_plugins ?? [])],
      [_plugins],
    );

    return (
      <NativeThemeProvider theme={theme} styles={styles} selectable={selectable}>
        <Root {...viewProps}>
          <BaseFluxdown
            Renderer={Renderer}
            ref={ref}
            text={text}
            build={build}
            streaming={streaming}
            patches={patches}
            plugins={plugins}
          />
        </Root>
      </NativeThemeProvider>
    );
  }),
  isPropsEqual,
);
