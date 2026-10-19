export type DemoPlayback = {
  source: string;

  cursor: number;

  step: number;

  playing: boolean;

  cycle: number;
};

export type DemoControls = {
  complete: boolean;

  playing: boolean;

  toggle: () => void;

  replay: () => void;
};

export type DemoTiming = {
  duration?: number;

  chunks: readonly number[];

  delays: readonly number[];
};
