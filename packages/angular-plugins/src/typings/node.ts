import type { TemplateRef, Type } from '@angular/core';

import type { SlotInputProps, SlotType } from './slot';

export interface AngularElementNode {
  kind: 'element';

  tagName: string;

  props: Record<string, unknown>;

  children?: AngularRenderNode;

  key?: string | number;
}

export interface AngularSlotNode {
  kind: 'slot';

  type: SlotType;

  props: SlotInputProps;

  key?: string | number;
}

export interface AngularComponentNode {
  kind: 'component';

  Component: Type<unknown>;

  props: unknown;

  tagName?: string;

  children?: AngularRenderNode;

  key?: string | number;
}

export interface AngularTemplateNode {
  kind: 'template';

  Template: TemplateRef<unknown>;

  context: object;

  key?: string | number;
}

export type AngularRenderNode =
  | string
  | number
  | null
  | undefined
  | boolean
  | AngularElementNode
  | AngularSlotNode
  | AngularComponentNode
  | AngularTemplateNode
  | AngularRenderNode[];
