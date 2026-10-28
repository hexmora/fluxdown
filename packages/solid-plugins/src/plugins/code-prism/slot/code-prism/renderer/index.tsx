import type { TokenStream } from 'prismjs';
import type { JSX } from 'solid-js';

import cn from 'classnames';
import { castArray, isString } from 'lodash-es';

import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { createHighlighted } from './hooks';
import styles from './index.module.scss';

const renderTokens = (tokens: TokenStream): JSX.Element => {
  if (isString(tokens)) {
    return tokens;
  }

  const items = castArray(tokens);

  return items.map((token) => {
    if (isString(token)) {
      return token;
    }

    return (
      <span class={['token', token.type, ...castArray(token.alias ?? [])].join(' ')}>
        {renderTokens(token.content)}
      </span>
    );
  });
};

export const CodePrismRenderer = (props: CodeHighlighterProps) => {
  const highlighted = createHighlighted(() => props);

  return (
    <CodeHighlighterRenderer
      {...props}
      class={cn(styles.root, props.class)}
      children={highlighted() === null ? null : renderTokens(highlighted()!)}
    />
  );
};
