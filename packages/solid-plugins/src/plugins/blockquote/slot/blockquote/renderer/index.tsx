import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { BlockquoteProps } from '../../../../../base';

import styles from './index.module.scss';

export const BlockquoteRenderer = (props: BlockquoteProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'parents',
    'render',
  ]);

  return (
    <blockquote {...elementProps} class={cn(styles.root, local.class)}>
      {local.children}
    </blockquote>
  );
};
