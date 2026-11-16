import type { JumpEvent, RepairCase } from '../../../../benchmark/repair/semantic.mjs';
import type { Locale } from '../../../type';

export type JumpScenario = {
  test: RepairCase;
  label: Record<Locale, string>;
};

export type JumpStream = {
  scenario: number;
  repair: boolean;
  run: number;
  cursor: number;
  advanceTo: number;
  playing: boolean;
  complete: boolean;
};

export type JumpReport = {
  frames: number;
  jumpFrames: number;
  events: JumpEvent[];
};

export type RestartOptions = {
  scenario?: number;
  repair?: boolean;
};
