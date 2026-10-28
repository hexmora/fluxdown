import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { createHighlighted } from './hooks';

export const CodeShikiRenderer = (props: CodeHighlighterProps) => {
  const tokens = createHighlighted(() => props);

  return (
    <CodeHighlighterRenderer
      {...props}
      children={tokens()?.flatMap((line, lineIndex) => [
        lineIndex > 0 ? '\n' : null,
        ...line.map((token) => (
          <span
            style={{
              color: token.color,
              'font-style': (token.fontStyle ?? 0) & 1 ? 'italic' : undefined,
              'font-weight': (token.fontStyle ?? 0) & 2 ? 'bold' : undefined,
              'text-decoration': (token.fontStyle ?? 0) & 4 ? 'underline' : undefined,
            }}
          >
            {token.content}
          </span>
        )),
      ])}
    />
  );
};
