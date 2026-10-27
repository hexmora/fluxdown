import { FluxdownBase } from '@fluxdown/react-base';
import { getNativeProps, ThemeProvider, useThemeConfig } from '@fluxdown/react-native-plugins/base';
import { forwardRef, memo } from 'react';
import { View } from 'react-native';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { isPropsEqual } from './utils';

export * from './type';
export { isPropsEqual } from './utils';

export const FluxdownRaw = /*#__PURE__*/ memo(
  /*#__PURE__*/ forwardRef<FluxdownRef, FluxdownRawProps>(function FluxdownRaw(
    { style, theme = 'light', plugins, ...props },
    ref,
  ) {
    const config = useThemeConfig(theme);

    return (
      <ThemeProvider value={config}>
        <View style={style}>
          <View>
            <FluxdownBase {...props} getProps={getNativeProps} plugins={plugins} ref={ref} />
          </View>
        </View>
      </ThemeProvider>
    );
  }),
  isPropsEqual,
);
