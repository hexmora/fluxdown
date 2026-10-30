import { Text, View } from '@tarojs/components';
import cn from 'classnames';

import type { TexProps } from '../../../../../base';

import styles from './index.module.scss';

export const TexRenderer = ({ className, mode = 'inline', style, tex }: TexProps) => {
  const Root = mode === 'display' ? View : Text;

  return (
    <Root className={cn(styles.root, className)} data-mode={mode} style={style}>
      {tex}
    </Root>
  );
};
