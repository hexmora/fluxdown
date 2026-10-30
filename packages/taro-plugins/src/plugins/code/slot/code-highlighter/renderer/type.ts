import type { ReactNode } from 'react';

import type { CodeHighlighterProps } from '../../../../../base';

export type CodeHighlighterRendererProps = CodeHighlighterProps & {
  children?: ReactNode;
};
