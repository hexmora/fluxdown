import { BaseFluxdown } from '@fluxdown/react-base';
import { PREFIX } from '@fluxdown/react-presets/base';
import cn from 'classnames';
import { forwardRef, memo } from 'react';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { Renderer } from '../../modules';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';
import { isPropsEqual } from './utils';

export * from '../../types';
export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    { className, style, theme = 'light', ...props },
    ref,
  ) {
    const themeStyles = useThemeStyles(theme);

    return (
      <div
        className={cn(styles.root, `${PREFIX}-root`, className)}
        style={{ ...themeStyles, ...style }}
      >
        <BaseFluxdown {...props} Renderer={Renderer} ref={ref} />
      </div>
    );
  }),
  isPropsEqual,
);
