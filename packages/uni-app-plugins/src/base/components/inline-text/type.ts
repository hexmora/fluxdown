import type { UniTextNode } from '../../../typings/render';

export interface InlineTextProps {
  parts: UniTextNode[];

  tail?: boolean;
}
