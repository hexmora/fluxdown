import { Text, View } from '@tarojs/components';
import cn from 'classnames';

import type { CodeHighlighterRendererProps } from './type';

import styles from './index.module.scss';

export const CodeHighlighterRenderer = ({
  Raw: _Raw,
  children,
  className,
  code,
  language = 'plaintext',
  meta: _meta,
  suffix,
  ...elementProps
}: CodeHighlighterRendererProps) => {
  return (
    <View data-tag="pre" {...elementProps} className={cn(styles.root, className)}>
      <Text
        data-tag="code"
        className={cn(styles.code, language ? `language-${language}` : undefined)}
      >
        {children ?? code}
        {suffix}
      </Text>
    </View>
  );
};
