import type { ShadProps } from '@fluxdown/react-base-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { createElement, Fragment } from 'react';

export class MockShadSlotPlugin extends BaseSlotPlugin<'Shad'> {
  static readonly key = 'mock-slot-shad';

  readonly type = 'Shad';

  readonly Component = ({ leading, active, isActive }: ShadProps) =>
    createElement(
      Fragment,
      null,
      leading,
      createElement('span', { 'data-testid': isActive ? 'shad-active' : undefined }, active),
    );
}
