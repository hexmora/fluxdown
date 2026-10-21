import { texToSvg as convert } from './utils';

export const texToSvg: (tex: string, mode: 'display' | 'inline') => string | null = convert;
