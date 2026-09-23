import type { IRawPatchItem } from '@fluxdown/types';
import type { IReadableClosure } from 'stative';

export interface IBlockSection {
  text: string;

  patches: IRawPatchItem[];
}

export type TextChunkerConfig = {
  indentedCode: boolean;

  setextHeading: boolean;

  tex: boolean;
};

export type TextChunkerInputs = {
  config?: IReadableClosure<TextChunkerConfig>;

  text: IReadableClosure<string>;

  patches: IReadableClosure<IRawPatchItem[]>;
};
