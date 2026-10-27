export interface PlaygroundProps {
  text: string;

  streaming?: boolean;

  pack?: 'full' | 'lite' | 'raw';

  effect?: 'none' | 'scale' | 'shad' | 'chunk' | 'suffix';

  smooth?: boolean;

  theme?: 'light' | 'dark';
}
