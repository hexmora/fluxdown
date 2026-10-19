import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';

export const CodeShikiRenderer = (props: CodeHighlighterProps) => {
  const tokens = useHighlighted(props.code, props.language ?? 'plaintext');

  return (
    <CodeHighlighterRenderer {...props}>
      {tokens?.flatMap((line, lineIndex) => [
        lineIndex > 0 ? '\n' : null,
        ...line.map((token) => (
          <span
            key={token.offset}
            style={{
              color: token.color,
              fontStyle: (token.fontStyle ?? 0) & 1 ? 'italic' : undefined,
              fontWeight: (token.fontStyle ?? 0) & 2 ? 'bold' : undefined,
              textDecoration: (token.fontStyle ?? 0) & 4 ? 'underline' : undefined,
            }}
          >
            {token.content}
          </span>
        )),
      ])}
    </CodeHighlighterRenderer>
  );
};
