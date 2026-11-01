import type { ComponentRef, EmbeddedViewRef } from '@angular/core';
import type { AngularRenderNode } from '@fluxdown/angular-plugins/typings';

export interface RenderRange {
  update(node: AngularRenderNode): void;

  destroy(): void;
}

export interface RenderRecord {
  key: string;

  source: AngularRenderNode;

  first: Node;

  last: Node;

  props: Record<string, unknown>;

  listeners: Map<string, () => void>;

  children?: RenderRange;

  component?: ComponentRef<unknown>;

  template?: EmbeddedViewRef<unknown>;
}
