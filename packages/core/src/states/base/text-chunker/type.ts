import type { IRawPatchItem } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

export interface IBlockSection {
  text: string;

  patches: IRawPatchItem[];
}

export type TextChunkerInputs = {
  text: IReadableClosure<string>;

  patches: IReadableClosure<IRawPatchItem[]>;
};
