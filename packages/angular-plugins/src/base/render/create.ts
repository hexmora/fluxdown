import type { TemplateRef, Type } from '@angular/core';
import type {
  AngularComponentNode,
  AngularElementNode,
  AngularRenderNode,
  AngularTemplateNode,
} from '@fluxdown/angular-plugins/typings';

export const createElement = (
  tagName: string,
  props: Record<string, unknown> = {},
  children?: AngularRenderNode,
): AngularElementNode => {
  const { key, ...attributes } = props;

  return {
    kind: 'element',
    tagName,
    props: attributes,
    children,
    key: typeof key === 'string' || typeof key === 'number' ? key : undefined,
  };
};

export const createComponentNode = (
  Component: Type<unknown>,
  props: unknown,
  options: Pick<AngularComponentNode, 'tagName' | 'children' | 'key'> = {},
): AngularComponentNode => {
  return { kind: 'component', Component, props, ...options };
};

export const createTemplateNode = <T extends object>(
  Template: TemplateRef<T>,
  context: T,
  key?: string | number,
): AngularTemplateNode => {
  return { kind: 'template', Template: Template as TemplateRef<unknown>, context, key };
};
