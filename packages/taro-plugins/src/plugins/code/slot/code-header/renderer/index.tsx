import { Button, Text, View } from '@tarojs/components';
import cn from 'classnames';
import { isFunction } from 'lodash-es';

import {
  type CodeHeaderAction,
  CodeHeaderInnerActionKey,
  type CodeHeaderProps,
} from '../../../../../base';
import { useCopy } from './hooks';
import styles from './index.module.scss';
import { renderAction } from './utils';

export const CodeHeaderRenderer = ({ Raw: _Raw, ...props }: CodeHeaderProps) => {
  const { actions, className, code, language, left, meta, onCopy, ...elementProps } = props;

  const { copy, isCopied, isCopying } = useCopy({ code, language, meta, onCopy });

  const copyAction: CodeHeaderAction = {
    key: CodeHeaderInnerActionKey.Copy,
    target: (
      <Button
        ariaLabel={isCopied ? 'Copied' : 'Copy'}
        className={styles.action}
        disabled={isCopying}
        onClick={() => void copy()}
      >
        <Text aria-hidden={true}>{isCopied ? '✓' : '⧉'}</Text>
        {isCopied ? 'Copied' : 'Copy'}
      </Button>
    ),
  };

  const resolvedActions = isFunction(actions)
    ? actions([copyAction])
    : [copyAction, ...(actions ?? [])];

  return (
    <View {...elementProps} className={cn(styles.root, className)}>
      <View className={styles.language}>{left ?? language ?? 'text'}</View>
      <View className={styles.actions}>{resolvedActions.map(renderAction)}</View>
    </View>
  );
};
