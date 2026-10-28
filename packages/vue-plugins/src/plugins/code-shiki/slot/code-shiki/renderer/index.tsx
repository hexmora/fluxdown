import { defineComponent } from 'vue';

import type { CodeHighlighterProps } from '../../../../../base';

import { CodeHighlighterRenderer } from '../../../../code';
import { useHighlighted } from './hooks';

export const CodeShikiRenderer = /*#__PURE__*/ defineComponent(
  (props: CodeHighlighterProps) => {
    const tokens = useHighlighted(() => props);

    return () => {
      const children = tokens.value?.flatMap((line, lineIndex) => [
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
      ]);

      return <CodeHighlighterRenderer {...props} children={children} />;
    };
  },
  {
    name: 'FluxdownCodeShiki',
    props: ['Raw', 'class', 'style', 'code', 'language', 'meta', 'suffix'],
    inheritAttrs: false,
  },
);
