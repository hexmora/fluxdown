import type { Element } from 'hast';

import { ReactRenderer } from '@fluxdown/react-base';
import { getReactNativeProps } from '@fluxdown/react-native-presets/base';

export class Renderer extends ReactRenderer {
  protected getProps(node?: Element): Record<string, unknown> {
    return getReactNativeProps(node);
  }
}
