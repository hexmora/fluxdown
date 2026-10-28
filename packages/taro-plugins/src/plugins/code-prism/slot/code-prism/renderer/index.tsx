import cn from 'classnames';

import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';
import styles from './index.module.scss';

export const CodePrismRenderer = (props: CodeHighlighterProps) => {
  const { className, code, language = 'plaintext' } = props;

  const highlighted = useHighlighted(code, language);

  return (
    <CodeHighlighterRenderer {...props} className={cn(styles.root, className)}>
      {highlighted}
    </CodeHighlighterRenderer>
  );
};
