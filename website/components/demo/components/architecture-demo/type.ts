import type { HastRoot, IBlockCompiler } from '@fluxdown/core';
import type { ReactNode } from 'react';
import type { IReadableClosure } from 'stative';

export type Block = IBlockCompiler['value']['value'][number];
export type HastNode = HastRoot | HastRoot['children'][number];
export type HastElement = Extract<HastNode, { type: 'element' }>;

export type Change = {
  id: number;
  time: number;
  kind: 'added' | 'removed';
};

export type TextPart = {
  value: string;
  position?: number;
  change?: Change;
};

export type TextSnapshot = {
  value: string;
  parts: TextPart[];
};

export type TreeSnapshot = {
  key: number;
  signature: string;
  node: HastNode;
  label: TextSnapshot;
  text: TextSnapshot;
  children: TreeSnapshot[];
  removed: TreeSnapshot[];
  change?: Change;
};

export type BlockSnapshot = {
  key: string;
  tree: HastRoot;
};

export type RenderOutput = {
  key: string;
  content: IReadableClosure<ReactNode>;
};

export type RenderSnapshot = {
  key: string;
  content: ReactNode;
};

export type PipelineSnapshot = {
  sections: string[];
  compiled: BlockSnapshot[];
  mapped: BlockSnapshot[];
  rendered: RenderSnapshot[];
};
