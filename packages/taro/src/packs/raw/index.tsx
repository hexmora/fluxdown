import type { CSSProperties } from 'react';

import { FluxdownBase } from '@fluxdown/react-base';
import { getTaroProps, PREFIX, TextColorProvider } from '@fluxdown/taro-plugins/base';
import { View } from '@tarojs/components';
import cn from 'classnames';
import { forwardRef, memo } from 'react';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { ROOT_CLASS_NAME } from '../../consts';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';
import { isPropsEqual, mergeStyles } from './utils';

export * from '../../types';
export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    { className, style, theme = 'light', plugins, ...props },
    ref,
  ) {
    const themeStyles = useThemeStyles(theme);

    const rootStyles = mergeStyles(themeStyles, style) as CSSProperties & Record<string, string>;

    const color = rootStyles.color ?? rootStyles[`--${PREFIX}-colors-fg`];

    return (
      <View className={cn(styles.root, ROOT_CLASS_NAME, className)} style={rootStyles}>
        <TextColorProvider
          value={color}
          muted={rootStyles[`--${PREFIX}-colors-fg-muted`]}
          accent={rootStyles[`--${PREFIX}-colors-accent`]}
        >
          <FluxdownBase {...props} getProps={getTaroProps} plugins={plugins} ref={ref} />
        </TextColorProvider>
      </View>
    );
  }),
  isPropsEqual,
);
