import { FluxdownBase } from '@fluxdown/react-base';
import { getReactProps } from '@fluxdown/react-plugins/base';
import cn from 'classnames';
import { forwardRef, memo } from 'react';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { ROOT_CLASS_NAME } from '../../consts';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';
import { isPropsEqual } from './utils';

export * from '../../types';
export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    { className, style, theme = 'light', plugins, ...props },
    ref,
  ) {
    const themeStyles = useThemeStyles(theme);

    return (
      <div
        className={cn(styles.root, ROOT_CLASS_NAME, className)}
        style={{ ...themeStyles, ...style }}
      >
        <FluxdownBase {...props} getProps={getReactProps} plugins={plugins} ref={ref} />
      </div>
    );
  }),
  isPropsEqual,
);
