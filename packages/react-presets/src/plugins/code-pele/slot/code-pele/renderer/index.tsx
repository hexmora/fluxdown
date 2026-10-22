import { lazy, Suspense } from 'react';

import type { CodeBlockProps } from '../../../../../base';

const LazyPeleRenderer = /*#__PURE__*/ lazy(() => import('./components/pele'));

export const CodePeleRenderer = ({ Raw, ...props }: CodeBlockProps) => {
  const language = props.language?.toLowerCase();

  if (language !== 'mermaid' && language !== 'mindmap') {
    return Raw && <Raw {...props} />;
  }

  return (
    <Suspense fallback={Raw && <Raw {...props} />}>
      <LazyPeleRenderer {...props} Raw={Raw} />
    </Suspense>
  );
};
