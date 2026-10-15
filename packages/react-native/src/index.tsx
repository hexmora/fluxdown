import { BaseFluxdown } from '@fluxdown/react-base';
import { NativeThemeProvider } from '@fluxdown/react-native-presets/base';
import { PRESET_SLOT_PLUGINS } from '@fluxdown/react-native-presets/slot';
import { forwardRef, memo, useMemo } from 'react';

import type { FluxdownProps, FluxdownRef } from './types';

import { Root } from './components';

export * from './types';

export const Fluxdown = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(function Fluxdown(
    { theme, styles, selectable, text, build, streaming, patches, plugins: _plugins, ...viewProps },
    ref,
  ) {
    const plugins = useMemo(
      () => [{ slots: PRESET_SLOT_PLUGINS }, ...(_plugins ?? [])],
      [_plugins],
    );

    return (
      <NativeThemeProvider theme={theme} styles={styles} selectable={selectable}>
        <Root {...viewProps}>
          <BaseFluxdown
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
);
