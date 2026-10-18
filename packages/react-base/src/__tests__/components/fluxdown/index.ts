import { castArray } from 'lodash-es';
import { createElement, forwardRef } from 'react';

import type { BaseFluxdownProps, BaseFluxdownRef } from '../../../types';

import { BaseFluxdown } from '../../..';
import { MOCK_PRESET_SLOT_PLUGINS } from '../../plugins';

export const Fluxdown = forwardRef<BaseFluxdownRef, BaseFluxdownProps>(function Fluxdown(
  { plugins = [], ...props },
  ref,
) {
  return createElement(
    'div',
    null,
    createElement(BaseFluxdown, {
      ...props,
      ref,
      plugins: [{ slots: MOCK_PRESET_SLOT_PLUGINS }, ...castArray(plugins)],
    }),
  );
});
