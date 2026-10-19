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
