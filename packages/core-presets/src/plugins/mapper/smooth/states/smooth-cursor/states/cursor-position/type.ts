import type { IReadableClosure } from 'stative';

import type { SmoothInterpolatorClass } from '../../../../type';
import type { BlockRevision } from '../block-revisions';
import type { SmoothDriverInputs } from '../smooth-ticks';
import type { SmoothTick } from '../smooth-ticks/states';

export interface SmoothInterpolatorInputs extends SmoothDriverInputs {
  /**
   * Constructor used to determine visible progress per tick.
   */
  interpolation: IReadableClosure<SmoothInterpolatorClass>;
}

export interface CursorPositionInputs extends SmoothInterpolatorInputs {
  revisions: IReadableClosure<BlockRevision[]>;

  ticks: IReadableClosure<SmoothTick | null>;
}

export interface SmoothPosition {
  /**
   * Inclusive index of the last visible block, or -1 when no blocks are available.
   */
  blockIndex: number;

  /**
   * End offset in the last visible block, measured in its base-length units.
   */
  charIndex: number;
}
