import cn from 'classnames';
import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { ListProps } from '../../../../../base';

import styles from './index.module.scss';

export const ListRenderer = (props: ListProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'parents',
    'render',
    'type',
  ]);

  return (
    <Dynamic
      component={local.type === 'ordered' ? 'ol' : 'ul'}
      {...elementProps}
      class={cn(styles.root, local.class)}
    >
      {local.children}
    </Dynamic>
  );
};
