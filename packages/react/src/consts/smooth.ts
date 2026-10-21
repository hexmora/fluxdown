import type { SmoothDriverClass, SmoothInterpolatorClass } from '@fluxdown/core-presets/mapper';

import {
  IntervalSmoothDriver,
  RafSmoothDriver,
  SpringSmoothInterpolator,
} from '@fluxdown/core-presets/mapper';

export const ALL_DRIVERS: SmoothDriverClass[] = [RafSmoothDriver, IntervalSmoothDriver];

export const ALL_INTERPOLATORS: SmoothInterpolatorClass[] = [SpringSmoothInterpolator];
