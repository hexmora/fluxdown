import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { EmphasisProps } from '../../../../../base';

import styles from './index.module.scss';

export const EmphasisRenderer = (props: EmphasisProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'parents',
    'render',
  ]);

  return (
    <em {...elementProps} class={cn(styles.root, local.class)}>
      {local.children}
    </em>
  );
};
