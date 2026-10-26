import type { EmphasisProps } from '../../../../../base';

import { InheritedText } from '../../../../../base';

export const EmphasisRenderer = ({ children }: EmphasisProps) => {
  return <InheritedText style={{ fontStyle: 'italic' }}>{children}</InheritedText>;
};
