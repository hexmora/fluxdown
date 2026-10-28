import cn from 'classnames';
import { defineComponent } from 'vue';

import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';
import styles from './index.module.scss';

export const CodePrismRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeHighlighterProps) => {
    const highlighted = useHighlighted(() => props);

    return () => {
      return (
        <CodeHighlighterRenderer
          {...props}
          class={cn(styles.root, props.class)}
          children={highlighted.value}
        />
      );
    };
  },
  {
    name: 'FluxdownCodePrism',
    props: ['Raw', 'class', 'style', 'code', 'language', 'meta', 'suffix'],
    inheritAttrs: false,
  },
);
