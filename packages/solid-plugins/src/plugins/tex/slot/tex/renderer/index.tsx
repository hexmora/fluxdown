import cn from 'classnames';
import { Dynamic } from 'solid-js/web';

import type { TexProps } from '../../../../../base';

import styles from './index.module.scss';

export const TexRenderer = (props: TexProps) => {
  return (
    <Dynamic
      component={props.mode === 'display' ? 'div' : 'span'}
      class={cn(styles.root, props.class)}
      data-mode={props.mode ?? 'inline'}
      style={props.style}
    >
      {props.tex}
    </Dynamic>
  );
};
