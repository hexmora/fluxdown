import type {
  SmoothDriverClass,
  SmoothInterpolatorClass,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

import {
  IntervalSmoothDriver,
  RafSmoothDriver,
  SpringSmoothInterpolator,
} from '@fluxdown/core-presets/plugins/mapper/smooth';

export const ALL_DRIVERS: SmoothDriverClass[] = [RafSmoothDriver, IntervalSmoothDriver];

export const ALL_INTERPOLATORS: SmoothInterpolatorClass[] = [SpringSmoothInterpolator];
