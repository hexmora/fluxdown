import { lazy, Suspense } from 'react';

import type { CodeBlockProps } from '../../../../../base';

const LazyMermaidRenderer = /*#__PURE__*/ lazy(() => import('./components/mermaid'));

export const CodeMermaidRenderer = ({ Raw, ...props }: CodeBlockProps) => {
  if (props.language?.toLowerCase() !== 'mermaid') {
    return Raw && <Raw {...props} />;
  }

  return (
    <Suspense fallback={Raw && <Raw {...props} />}>
      <LazyMermaidRenderer {...props} Raw={Raw} />
    </Suspense>
  );
};
