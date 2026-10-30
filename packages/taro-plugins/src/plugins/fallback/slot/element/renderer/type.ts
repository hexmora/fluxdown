import type { ElementProps } from '../../../../../base';

export type ElementRendererProps = ElementProps & {
  type?: string;

  checked?: boolean;
};
