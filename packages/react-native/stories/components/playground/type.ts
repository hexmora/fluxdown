import type { FluxdownProps } from '@fluxdown/react-native';

export interface PlaygroundProps {
  initialText: string;

  autoPlay?: boolean;

  theme?: FluxdownProps['theme'];
}
