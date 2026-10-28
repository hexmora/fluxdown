import cn from 'classnames';
import { isNumber } from 'lodash-es';
import { createMemo, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { HeadingProps } from '../../../../../base';

import styles from './index.module.scss';

export const HeadingRenderer = (props: HeadingProps) => {
  const [local, elementProps] = splitProps(props, [
    'Raw',
    'children',
    'class',
    'current',
    'level',
    'parents',
    'render',
  ]);

  const tagName = createMemo(() => {
    const level = local.level;

    const safeLevel =
      isNumber(level) && Number.isInteger(level) && level >= 1 && level <= 6 ? level : 1;

    return `h${safeLevel}` as 'h1';
  });

  return (
    <Dynamic component={tagName()} {...elementProps} class={cn(styles.root, local.class)}>
      {local.children}
    </Dynamic>
  );
};
