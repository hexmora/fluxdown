import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { ParagraphProps } from '../../../../../base';

import styles from './index.module.scss';

export const ParagraphRenderer = (props: ParagraphProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'parents',
    'render',
  ]);

  return (
    <p {...elementProps} class={cn(styles.root, local.class)}>
      {local.children}
    </p>
  );
};
