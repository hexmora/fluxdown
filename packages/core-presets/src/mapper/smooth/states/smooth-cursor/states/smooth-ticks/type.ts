import type { IReadableClosure } from 'stative';

import type { SmoothTickerClass } from '../../../../type';
import type { BlockRevision } from '../block-revisions';

export interface SmoothTicksInputs {
  revisions: IReadableClosure<BlockRevision[]>;

  /**
   * Whether newly appended content advances on ticker events.
   */
  enabled: IReadableClosure<boolean>;

  /**
   * Constructor used to supply animation timestamps.
   */
  ticker: IReadableClosure<SmoothTickerClass>;
}
