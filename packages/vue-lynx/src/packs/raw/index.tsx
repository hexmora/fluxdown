import type { CSSProperties } from '@lynx-js/types';

import { FluxdownBase } from '@fluxdown/vue-base';
import {
  getTextStyle,
  getVueLynxProps,
  mapTokensToStyles,
  ThemeProvider,
  useThemeConfig,
} from '@fluxdown/vue-lynx-plugins/base';
import { defineComponent, normalizeClass, normalizeStyle, shallowRef } from 'vue';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { ROOT_CLASS_NAME } from '../../consts';
import { ensureRuntime } from '../../modules/runtime';
import styles from '../../styles/index.module.scss';

ensureRuntime();

export * from '../../types';
export * from './type';

export const FluxdownRaw = /*#__PURE__*/ defineComponent(
  (props: FluxdownRawProps, { attrs, expose }) => {
    const base = shallowRef<FluxdownRef>();

    const theme = useThemeConfig(() => props.theme ?? 'light');

    expose({
      get value() {
        return base.value?.value;
      },
      destroy() {
        base.value?.destroy();
      },
    });

    return () => {
      const { class: className, style, ...elementAttrs } = attrs;

      return (
        <ThemeProvider value={theme.value}>
          {{
            default: () => (
              <view
                {...elementAttrs}
                class={normalizeClass([styles.root, ROOT_CLASS_NAME, className])}
                style={
                  normalizeStyle([
                    {
                      ...mapTokensToStyles(theme.value.tokens),
                      ...getTextStyle(theme.value),
                      backgroundColor: theme.value.tokens.colors.bg,
                    },
                    style,
                  ]) as CSSProperties
                }
              >
                <FluxdownBase {...props} getProps={getVueLynxProps} ref={base} />
              </view>
            ),
          }}
        </ThemeProvider>
      );
    };
  },
  {
    name: 'FluxdownRaw',
    props: ['text', 'build', 'streaming', 'patches', 'plugins', 'theme'],
    inheritAttrs: false,
  },
);
