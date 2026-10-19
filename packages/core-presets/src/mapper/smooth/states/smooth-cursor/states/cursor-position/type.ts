import type { IReadableClosure } from 'stative';

import type { SmoothSchedulerClass } from '../../../../type';
import type { BlockRevision } from '../block-revisions';
import type { SmoothTickerInputs } from '../smooth-ticks';
import type { SmoothTick } from '../smooth-ticks/states';

export interface SmoothSchedulerInputs extends SmoothTickerInputs {
  /**
   * Constructor used to determine visible progress per tick.
   */
  scheduler: IReadableClosure<SmoothSchedulerClass>;
}

export interface CursorPositionInputs extends SmoothSchedulerInputs {
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
