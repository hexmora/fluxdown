import type { Component } from 'svelte';

export interface SlotComponent<P extends object = Record<string, unknown>> {
  readonly slot: string;

  readonly props?: P;
}

export type RenderComponent = string | Component<any> | SlotComponent<any>;

export interface RenderElement {
  Component: RenderComponent;

  props: Record<string, unknown>;

  children: SvelteNode;

  key?: string | number;
}

export type SvelteNode =
  | RenderElement
  | string
  | number
  | boolean
  | null
  | undefined
  | SvelteNode[];

export const createElement = (
  Component: RenderComponent,
  properties: Record<string, unknown> | null = null,
  ...children: SvelteNode[]
): RenderElement => {
  const { key, children: inheritedChildren, ...props } = properties ?? {};

  return {
    Component,
    props,
    children: children.length ? children : (inheritedChildren as SvelteNode),
    key: key as string | number | undefined,
  };
};
