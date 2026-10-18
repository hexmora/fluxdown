import { BaseFluxdown } from '@fluxdown/react-base';
import { PREFIX } from '@fluxdown/react-presets/base';
import { PRESET_SLOT_PLUGINS } from '@fluxdown/react-presets/slot';
import cn from 'classnames';
import { castArray, isBoolean } from 'lodash-es';
import { forwardRef, memo, useMemo } from 'react';

import type { FluxdownProps, FluxdownRef } from './types';

import { useShadStyles } from './hooks';
import { Renderer } from './modules';
import styles from './styles/index.module.scss';
import { useThemeStyles } from './theme';

export * from './types';

export const Fluxdown = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownProps>(function Fluxdown(
    { className, style, theme = 'light', streaming = false, plugins: _plugins, ...props },
    ref,
  ) {
    const plugins = useMemo(
      () => [{ slots: PRESET_SLOT_PLUGINS }, ...castArray(_plugins ?? [])],
      [_plugins],
    );

    const themeStyles = useThemeStyles(theme);

    const shadStyles = useShadStyles(isBoolean(streaming) ? streaming : (streaming.shad ?? true));

    return (
      <div
        className={cn(styles.root, `${PREFIX}-root`, className)}
        style={{ ...themeStyles, ...shadStyles, ...style }}
      >
        <BaseFluxdown
          {...props}
          Renderer={Renderer}
          ref={ref}
          streaming={streaming}
          plugins={plugins}
        />
      </div>
    );
  }),
);
