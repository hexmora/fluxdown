import type { IReadableClosure } from 'stative';

export interface CompletedInputs {
  /**
   * Source whose completion is observed independently of its values.
   */
  source: IReadableClosure<unknown>;
}
