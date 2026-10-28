import cn from 'classnames';
import { splitProps } from 'solid-js';

import type { StrongProps } from '../../../../../base';

import styles from './index.module.scss';

export const StrongRenderer = (props: StrongProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'parents',
    'render',
  ]);

  return (
    <strong {...elementProps} class={cn(styles.root, local.class)}>
      {local.children}
    </strong>
  );
};
