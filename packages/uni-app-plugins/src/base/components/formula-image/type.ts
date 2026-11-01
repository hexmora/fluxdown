import type { SvgImageData } from '../svg-image';

export interface FormulaImageProps {
  tex: string;

  mode?: 'inline' | 'display';

  fontSize: number;

  color: string;

  render: (
    tex: string,
    mode: 'inline' | 'display',
    fontSize: number,
    color: string,
  ) => SvgImageData | null;
}
