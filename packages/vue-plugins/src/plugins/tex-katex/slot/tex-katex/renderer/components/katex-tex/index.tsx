import cn from 'classnames';
import { computed, defineComponent, h, onMounted } from 'vue';

import type { TexKatexRendererProps } from '../../type';

import { TexRenderer } from '../../../../../../tex';
import styles from './index.module.scss';
import { katexTexToHtml } from './utils';

const TexKatexRenderer = /*#__PURE__*/ defineComponent(
  (props: TexKatexRendererProps) => {
    const html = computed(() => katexTexToHtml(props.tex, props.mode ?? 'inline'));

    onMounted(() => {
      void import('katex/dist/katex.min.css').catch(() => {
        // Keep formulas available when the optional stylesheet cannot load.
      });
    });

    return () => {
      const { Fallback = TexRenderer, class: className, mode = 'inline', style, tex } = props;

      if (html.value === null) {
        return h(Fallback, props);
      }

      return h(mode === 'display' ? 'div' : 'span', {
        class: cn(styles.root, className),
        innerHTML: html.value,
        'data-mode': mode,
        'data-tex': tex,
        style,
      });
    };
  },
  {
    name: 'FluxdownKatex',
    props: ['Raw', 'Fallback', 'class', 'style', 'current', 'parents', 'render', 'mode', 'tex'],
    inheritAttrs: false,
  },
);

export default TexKatexRenderer;
