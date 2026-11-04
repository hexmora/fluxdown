import { FluxdownBase } from '@fluxdown/vue-base';
import { getVueProps } from '@fluxdown/vue-plugins/base';
import { defineComponent, shallowRef } from 'vue';

import type { FluxdownRawProps, FluxdownRef } from './type';

import { ROOT_CLASS_NAME } from '../../consts';
import styles from '../../styles/index.module.scss';
import { useThemeStyles } from '../../theme';

export * from '../../types';
export * from './type';

export const FluxdownRaw = /*#__PURE__*/ defineComponent(
  (props: FluxdownRawProps, { attrs, expose }) => {
    const base = shallowRef<FluxdownRef>();

    const theme = useThemeStyles(() => props.theme ?? 'light');

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
        <div
          {...elementAttrs}
          class={[styles.root, ROOT_CLASS_NAME, className]}
          style={[theme.value, style]}
        >
          <FluxdownBase {...props} getProps={getVueProps} ref={base} />
        </div>
      );
    };
  },
  {
    name: 'FluxdownRaw',
    props: ['text', 'build', 'streaming', 'patches', 'plugins', 'theme'],
    inheritAttrs: false,
  },
);
