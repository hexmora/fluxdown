import type { Element } from 'hast';

import { ReactRenderer } from '@fluxdown/react-base';
import { getReactProps } from '@fluxdown/react-presets/base';

export class Renderer extends ReactRenderer {
  protected getProps(node?: Element): Record<string, unknown> {
    return getReactProps(node);
  }
}
