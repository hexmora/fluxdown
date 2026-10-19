import cn from 'classnames';
import { useMemo } from 'react';

import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import styles from './index.module.scss';
import { highlightCode } from './utils';

export const CodePrismRenderer = (props: CodeHighlighterProps) => {
  const { className, code, language = 'plaintext' } = props;
  const highlighted = useMemo(() => highlightCode(code, language), [code, language]);

  return (
    <CodeHighlighterRenderer {...props} className={cn(styles.root, className)}>
      {highlighted}
    </CodeHighlighterRenderer>
  );
};
