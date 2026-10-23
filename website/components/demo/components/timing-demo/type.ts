import type {
  IScheduler,
  ITicker,
  SmoothSchedulerClass,
  SmoothTickerClass,
} from '@fluxdown/core-plugins/plugins/mapper/smooth';

export interface TimingCursorParams {
  source: string;
  text: string;
  cycle: number;
  active: boolean;
  reducedMotion: boolean | null;
  Ticker: SmoothTickerClass;
  Scheduler: SmoothSchedulerClass;
}

export interface TimingPlayback {
  ticker: ITicker;
  scheduler: IScheduler;
  received: number;
  visible: number;
}
