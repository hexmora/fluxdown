export type DemoEffect = 'scale' | 'shad' | 'chunk' | 'suffix';

export type LynxDemoData = {
  text: string;

  streaming: boolean;

  effect: DemoEffect;

  smooth: boolean;

  dark: boolean;

  cycle: number;
};
