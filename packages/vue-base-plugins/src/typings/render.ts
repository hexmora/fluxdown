import type { Element } from 'hast';

export type GetPropsFunction = (node?: Element) => Record<string, unknown>;
