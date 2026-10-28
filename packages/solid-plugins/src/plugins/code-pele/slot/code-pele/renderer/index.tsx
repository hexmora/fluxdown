import { ErrorBoundary, lazy, Show, splitProps, Suspense } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import type { CodeBlockProps } from '../../../../../base';

const RawRenderer = (props: CodeBlockProps) => {
  const [local, rest] = splitProps(props, ['Raw']);

  return <Dynamic component={local.Raw ?? undefined} {...rest} />;
};

const PeleRenderer = /*#__PURE__*/ lazy(() => import('./components/pele'));

export const CodePeleRenderer = (props: CodeBlockProps) => {
  return (
    <Show
      when={['mermaid', 'mindmap'].includes(props.language?.toLowerCase() ?? '')}
      fallback={<RawRenderer {...props} />}
    >
      <ErrorBoundary fallback={<RawRenderer {...props} />}>
        <Suspense fallback={<RawRenderer {...props} />}>
          <PeleRenderer {...props} />
        </Suspense>
      </ErrorBoundary>
    </Show>
  );
};
