import cn from 'classnames';
import { computed, defineComponent, h } from 'vue';

import type { TexProps } from '../../../../../../../base';

import styles from '../../index.module.scss';
import { texToSvg } from './utils';

export const MathjaxTexRenderer = /*#__PURE__*/ defineComponent(
  (props: TexProps) => {
    const html = computed(() => texToSvg(props.tex, props.mode ?? 'inline'));

    return () => {
      const { class: className, mode = 'inline', style, tex } = props;

      return h(mode === 'display' ? 'div' : 'span', {
        'aria-label': html.value === null ? undefined : tex,
        class: cn(styles.root, className),
        'data-formula-error': html.value === null || undefined,
        'data-mode': mode,
        'data-tex': tex,
        role: html.value === null ? undefined : 'math',
        style,
        ...(html.value === null ? { textContent: tex } : { innerHTML: html.value }),
      });
    };
  },
  {
    name: 'FluxdownMathjax',
    props: ['Raw', 'class', 'style', 'current', 'parents', 'render', 'mode', 'tex'],
    inheritAttrs: false,
  },
);

export default MathjaxTexRenderer;
