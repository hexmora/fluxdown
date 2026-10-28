import cn from 'classnames';

import type { BreakLineProps } from '../../../../../base';

import styles from './index.module.scss';

export const BreakLineRenderer = ({ Raw: _Raw, ...props }: BreakLineProps) => {
  const { class: className, ...elementProps } = props;

  return <br {...elementProps} class={cn(styles.root, className)} />;
};

BreakLineRenderer.inheritAttrs = false;
