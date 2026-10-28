import { Text, View } from '@tarojs/components';
import cn from 'classnames';

import type { ElementRendererProps } from './type';

import { isSafeTagName } from '../../../../../base';
import { INLINE_TAG_NAMES } from './consts';
import styles from './index.module.scss';

export const ElementRenderer = ({
  Raw: _Raw,
  children,
  tagName,
  ...props
}: ElementRendererProps) => {
  if (!isSafeTagName(tagName)) {
    return null;
  }

  if (tagName === 'input') {
    return props.type === 'checkbox' ? (
      <Text className={styles.checkbox} data-tag="checkbox" data-checked={!!props.checked} />
    ) : null;
  }

  const Root = INLINE_TAG_NAMES.includes(tagName) ? Text : View;

  return (
    <Root {...props} className={cn(styles.root, props.className)} data-tag={tagName}>
      {children}
    </Root>
  );
};
