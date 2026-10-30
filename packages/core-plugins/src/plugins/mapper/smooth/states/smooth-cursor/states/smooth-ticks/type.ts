import type { IReadableClosure } from 'stative';

import type { SmoothDriverClass } from '../../../../type';
import type { BlockRevision } from '../block-revisions';

export interface SmoothDriverInputs {
  /**
   * Whether newly appended content advances on driver events.
   */
  enabled: IReadableClosure<boolean>;

  /**
   * Constructor used to supply animation timestamps.
   */
  driver: IReadableClosure<SmoothDriverClass>;
}

export interface SmoothTicksInputs extends SmoothDriverInputs {
  revisions: IReadableClosure<BlockRevision[]>;
}
