import { BaseFluxdown } from '@fluxdown/react-base';
import { NativeThemeProvider } from '@fluxdown/react-native-presets/base';
import { PRESET_SLOT_PLUGINS } from '@fluxdown/react-native-presets/slot';
import { castArray } from 'lodash-es';
import { forwardRef, memo, useMemo } from 'react';

import type { FluxdownProps, FluxdownRef } from './types';

import { Root } from './components';
import { Renderer } from './modules';

export * from './types';

export const Fluxdown = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(function Fluxdown(
    { theme, styles, selectable, text, build, streaming, patches, plugins: _plugins, ...viewProps },
    ref,
  ) {
    const plugins = useMemo(
      () => [{ slots: PRESET_SLOT_PLUGINS }, ...castArray(_plugins ?? [])],
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
);
