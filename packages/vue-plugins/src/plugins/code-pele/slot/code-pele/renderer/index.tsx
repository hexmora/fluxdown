import { defineAsyncComponent, h } from 'vue';

import type { CodeBlockProps } from '../../../../../base';

const RawRenderer = ({ Raw, ...props }: CodeBlockProps) => {
  return Raw ? h(Raw, props) : null;
};

const PeleRenderer = /*#__PURE__*/ defineAsyncComponent({
  loader: () => import('./components/pele').then((module) => module.default),
  loadingComponent: RawRenderer,
  errorComponent: RawRenderer,
  delay: 0,
});

export const CodePeleRenderer = (props: CodeBlockProps) => {
  const language = props.language?.toLowerCase();

  if (language !== 'mermaid' && language !== 'mindmap') {
    return <RawRenderer {...props} />;
  }

  return <PeleRenderer {...props} />;
};
