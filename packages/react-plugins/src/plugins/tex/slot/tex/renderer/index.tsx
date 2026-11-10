import cn from 'classnames';

import { getTexRoot, type TexProps } from '../../../../../base';
import styles from './index.module.scss';

export const TexRenderer = ({ className, mode = 'inline', parents, style, tex }: TexProps) => {
  const Root = getTexRoot(mode, parents);

  return (
    <Root className={cn(styles.root, className)} data-mode={mode} style={style}>
      {tex}
    </Root>
  );
};

export const TexLoadingRenderer = (props: TexProps) => <TexRenderer {...props} tex="" />;
