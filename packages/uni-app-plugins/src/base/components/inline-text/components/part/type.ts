import type { CSSProperties } from 'vue';

import type { UniTextNode } from '../../../../../typings/render';

export interface InlinePartProps {
  node: UniTextNode;

  textStyle: CSSProperties;
}
