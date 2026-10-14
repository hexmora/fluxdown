import type { StrongProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { createElement } from 'react';

export class MockStrongSlotPlugin extends BaseSlotPlugin<'Strong'> {
  static readonly key = 'mock-slot-strong';

  readonly type = 'Strong';

  readonly Component = ({ children }: StrongProps) => createElement('strong', null, children);
}
