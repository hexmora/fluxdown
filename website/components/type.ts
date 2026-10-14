export type Locale = 'en' | 'zh';

export type Frame = {
  end: number;
  delay: number;
};

export type Stream = {
  source: string;
  frames: Frame[];
  cursor: number;
  step: number;
  playing: boolean;
};
